package com.fit.microservices.auth.service.Impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fit.microservices.auth.client.UserClient;
import com.fit.microservices.auth.dto.*;
import com.fit.microservices.auth.model.AuthSession;
import com.fit.microservices.auth.model.Credential;
import com.fit.microservices.auth.outbox.OutboxEvent;
import com.fit.microservices.auth.outbox.OutboxEventRepository;
import com.fit.microservices.auth.repository.CredentialRepository;
import com.fit.microservices.auth.service.AuthService;
import com.fit.microservices.auth.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.codec.digest.DigestUtils;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

/**
 * THAY ĐỔI SO VỚI PHIÊN BẢN CŨ:
 * ─────────────────────────────────────────────────────────────────────
 * TRƯỚC: kafkaTemplate.send(topic, payload) — gọi thẳng trong business logic.
 *        Nếu Kafka down hoặc app crash SAU khi DB commit → event mất vĩnh viễn.
 *
 * SAU:   saveOutboxEvent(topic, payload) — ghi vào bảng outbox_events trong
 *        CÙNG DB transaction. OutboxEventPublisher sẽ poll và publish lên Kafka.
 *        Guarantee: DB commit thành công ↔ event sẽ được publish (at-least-once).
 * ─────────────────────────────────────────────────────────────────────
 * CÁC METHOD ĐƯỢC THÊM @Transactional (trước đây thiếu):
 *   - login()          → bây giờ cần ghi outbox (DB write)
 *   - verifyOtp()      → gọi buildLoginResponse() → ghi outbox
 *   - logout()         → ghi outbox
 *   - logoutAllDevices()→ ghi outbox
 *   - forgotPassword() → ghi outbox
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {

    private final CredentialRepository credentialRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final UserClient userClient;
    private final RedisTemplate<String, Object> redisTemplate;
    private final ObjectMapper objectMapper;

    // ← KafkaTemplate ĐÃ BỊ XOÁ KHỎI ĐÂY
    //   Việc publish Kafka giờ do OutboxEventPublisher đảm nhiệm
    private final OutboxEventRepository outboxEventRepository;

    private static final String SESSION_KEY_PREFIX           = "session:";
    private static final String USER_SESSIONS_PREFIX         = "user:sessions:";
    private static final long   REFRESH_TOKEN_EXPIRATION_DAYS = 30;
    private static final String OTP_KEY_PREFIX               = "otp:login:";
    private static final String TRUSTED_DEVICE_PREFIX        = "trusted:device:";
    private static final long   TRUSTED_DEVICE_EXPIRATION_DAYS = 30;

    // Brute-force protection
    private static final String LOGIN_ATTEMPTS_PREFIX  = "login:attempts:";
    private static final String LOGIN_LOCKED_PREFIX    = "login:locked:";
    private static final String LOGIN_LOCKCOUNT_PREFIX = "login:lockcount:";
    private static final int    MAX_FAILED_ATTEMPTS    = 15;
    private static final long   LOCK_STEP_MINUTES      = 5;

    private static final String GOOGLE_DEFAULT_PASSWORD = "123";
    private static final String GOOGLE_DEFAULT_ADDRESS  = "Chưa cập nhật";

    private static final String GOOGLE_TOKENINFO_URL =
            "https://oauth2.googleapis.com/tokeninfo?id_token=";

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    // Inject RestTemplate từ Spring context (có connection pool + timeout, xem RestTemplateConfig)
    private final RestTemplate restTemplate;

    // ═══════════════════════════════════════════════════════════════════
    // GOOGLE LOGIN
    // ═══════════════════════════════════════════════════════════════════

    @Override
    @Transactional // đã có từ trước — buildLoginResponse ghi outbox trong cùng TX
    public LoginResponse googleLogin(GoogleLoginRequest request) {
        Map<String, Object> googleInfo = verifyGoogleToken(request.getIdToken());
        String email   = (String) googleInfo.get("email");
        String name    = (String) googleInfo.getOrDefault("name", email.split("@")[0]);
        String picture = (String) googleInfo.getOrDefault("picture",
                "https://ui-avatars.com/api/?name=" + name);

        if (email == null || email.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Không lấy được email từ tài khoản Google");
        }

        Optional<Credential> existing = credentialRepository.findByEmail(email);
        Credential credential;
        if (existing.isPresent()) {
            credential = existing.get();
            log.info("[Google] Đăng nhập thành công: {}", email);
        } else {
            credential = autoRegisterGoogleUser(email, name, picture);
            log.info("[Google] Tự đăng ký tài khoản mới: {}", email);
        }

        redisTemplate.delete(LOGIN_ATTEMPTS_PREFIX + email);
        LoginResponse response = buildLoginResponse(credential);
        response.setStatus("SUCCESS");
        return response;
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> verifyGoogleToken(String idToken) {
        try {
            ResponseEntity<Map> resp = restTemplate.getForEntity(
                    GOOGLE_TOKENINFO_URL + idToken, Map.class);
            if (!resp.getStatusCode().is2xxSuccessful() || resp.getBody() == null) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Google token không hợp lệ");
            }
            Map<String, Object> body = resp.getBody();
            Object verified = body.get("email_verified");
            if (!"true".equals(verified) && !Boolean.TRUE.equals(verified)) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email Google chưa xác minh");
            }
            return body;
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            log.error("[Google] Lỗi xác minh token: {}", e.getMessage());
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,
                    "Xác minh Google token thất bại: " + e.getMessage());
        }
    }

    private Credential autoRegisterGoogleUser(String email, String name, String picture) {
        UserRequest userRequest = new UserRequest();
        userRequest.setFullName(name);
        userRequest.setEmail(email);
        userRequest.setPhone(null);
        userRequest.setAddress(GOOGLE_DEFAULT_ADDRESS);
        userRequest.setAvatarUrl(picture);
        UserResponse userResponse = userClient.createUser(userRequest);

        Credential credential = new Credential();
        credential.setEmail(email);
        credential.setPassword(passwordEncoder.encode(GOOGLE_DEFAULT_PASSWORD));
        credential.setUserId(userResponse.getId());
        credential.setRole("USER");
        return credentialRepository.save(credential);
    }

    // ═══════════════════════════════════════════════════════════════════
    // LOGIN (email/password + OTP)
    // ═══════════════════════════════════════════════════════════════════

    @Override
    @Transactional // ← THÊM MỚI: cần @Transactional để ghi outbox
    public LoginResponse login(LoginRequest request) {
        // 1. Check brute-force lock
        String lockedKey = LOGIN_LOCKED_PREFIX + request.getEmail();
        if (Boolean.TRUE.equals(redisTemplate.hasKey(lockedKey))) {
            Long remainingSeconds = redisTemplate.getExpire(lockedKey, TimeUnit.SECONDS);
            long remainingMinutes = (remainingSeconds != null && remainingSeconds > 0)
                    ? (remainingSeconds / 60) + 1
                    : LOCK_STEP_MINUTES;
            throw new ResponseStatusException(HttpStatus.LOCKED,
                    "ACCOUNT_LOCKED:" + remainingMinutes);
        }

        // 2. Tìm credential
        Credential credential = credentialRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED,
                        "Email hoặc mật khẩu không đúng"));

        // 3. Kiểm tra mật khẩu
        if (!passwordEncoder.matches(request.getPassword(), credential.getPassword())) {
            String lockMsg = recordFailedAttempt(request.getEmail());
            if (lockMsg != null) {
                throw new ResponseStatusException(HttpStatus.LOCKED, lockMsg);
            }
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,
                    "Email hoặc mật khẩu không đúng");
        }

        // 4. Đăng nhập thành công → xoá brute-force counter
        redisTemplate.delete(LOGIN_ATTEMPTS_PREFIX + request.getEmail());

        // 5. Kiểm tra Trusted Device
        if (request.getDeviceToken() != null && !request.getDeviceToken().isBlank()) {
            String redisKey = TRUSTED_DEVICE_PREFIX + credential.getUserId()
                    + ":" + request.getDeviceToken();
            if (Boolean.TRUE.equals(redisTemplate.hasKey(redisKey))) {
                redisTemplate.expire(redisKey, TRUSTED_DEVICE_EXPIRATION_DAYS, TimeUnit.DAYS);
                LoginResponse response = buildLoginResponse(credential);
                response.setStatus("SUCCESS");
                return response;
            }
        }

        // 6. Gửi OTP qua outbox → notification-service sẽ gửi email
        // SecureRandom thay cho Math.random() — cryptographically secure
        String otp = String.valueOf(100000 + SECURE_RANDOM.nextInt(900000));
        redisTemplate.opsForValue().set(OTP_KEY_PREFIX + request.getEmail(), otp, 5, TimeUnit.MINUTES);

        // TRƯỚC: kafkaTemplate.send("user-otp-topic", otpPayload)
        // SAU:   saveOutboxEvent → ghi DB cùng TX, publisher gửi Kafka sau
        saveOutboxEvent("user-otp-topic",
                Map.of("email", request.getEmail(), "otp", otp));

        return LoginResponse.builder()
                .status("OTP_SENT")
                .build();
    }

    // ═══════════════════════════════════════════════════════════════════
    // VERIFY OTP
    // ═══════════════════════════════════════════════════════════════════

    @Override
    @Transactional // ← THÊM MỚI: buildLoginResponse ghi outbox
    public LoginResponse verifyOtp(OtpVerificationRequest request) {
        String storedOtp = (String) redisTemplate.opsForValue().get(OTP_KEY_PREFIX + request.getEmail());
        if (storedOtp == null || !storedOtp.equals(request.getOtp())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Mã OTP không hợp lệ hoặc hết hạn");
        }

        redisTemplate.delete(OTP_KEY_PREFIX + request.getEmail());

        Credential credential = credentialRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Tài khoản không tồn tại"));

        String deviceToken = UUID.randomUUID().toString();
        String redisKey = TRUSTED_DEVICE_PREFIX + credential.getUserId() + ":" + deviceToken;
        redisTemplate.opsForValue().set(redisKey, "1", TRUSTED_DEVICE_EXPIRATION_DAYS, TimeUnit.DAYS);

        LoginResponse response = buildLoginResponse(credential);
        response.setDeviceToken(deviceToken);
        response.setStatus("SUCCESS");
        return response;
    }

    // ═══════════════════════════════════════════════════════════════════
    // REFRESH TOKEN
    // ═══════════════════════════════════════════════════════════════════

    @Override
    public LoginResponse refreshToken(RefreshTokenRequest request) {
        String refreshToken = request.getRefreshToken();
        if (!jwtUtil.isTokenValid(refreshToken)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid refresh token");
        }
        if (!jwtUtil.isRefreshToken(refreshToken)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not a refresh token");
        }

        String email        = jwtUtil.extractEmail(refreshToken);
        String sessionIdStr = jwtUtil.extractSessionId(refreshToken);
        if (sessionIdStr == null || sessionIdStr.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing session id");
        }

        Credential credential = credentialRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        AuthSession session = (AuthSession) redisTemplate.opsForValue().get(SESSION_KEY_PREFIX + sessionIdStr);
        if (session == null || session.isRevoked()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Session not found or revoked");
        }

        String hashedIncomingToken = DigestUtils.sha256Hex(refreshToken);
        if (!hashedIncomingToken.equals(session.getRefreshTokenHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh token not match or revoked");
        }

        String newAccessToken  = jwtUtil.generateAccessToken(
                credential.getEmail(),
                Map.of("userId", credential.getUserId(), "role", credential.getRole(), "sessionId", sessionIdStr));
        String newRefreshToken = jwtUtil.generateRefreshToken(credential.getEmail(), sessionIdStr);

        session.setRefreshTokenHash(DigestUtils.sha256Hex(newRefreshToken));
        session.setLastUsedAt(LocalDateTime.now());
        redisTemplate.opsForValue().set(SESSION_KEY_PREFIX + sessionIdStr, session,
                REFRESH_TOKEN_EXPIRATION_DAYS, TimeUnit.DAYS);

        return LoginResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .role(credential.getRole())
                .sessionId(sessionIdStr)
                .build();
    }

    // ═══════════════════════════════════════════════════════════════════
    // LOGOUT
    // ═══════════════════════════════════════════════════════════════════

    @Override
    @Transactional // ← THÊM MỚI: ghi outbox
    public void logout(RefreshTokenRequest request) {
        String refreshToken = request.getRefreshToken();
        if (!jwtUtil.isTokenValid(refreshToken)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid token");
        }

        String sessionIdStr = jwtUtil.extractSessionId(refreshToken);
        if (sessionIdStr == null || sessionIdStr.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Missing session id");
        }

        AuthSession session = (AuthSession) redisTemplate.opsForValue().get(SESSION_KEY_PREFIX + sessionIdStr);
        if (session != null) {
            redisTemplate.delete(SESSION_KEY_PREFIX + sessionIdStr);
            redisTemplate.opsForSet().remove(USER_SESSIONS_PREFIX + session.getUserId(), sessionIdStr);

            // TRƯỚC: kafkaTemplate.send("user-logout-topic", ...)
            saveOutboxEvent("user-logout-topic", session.getUserId());
        }
    }

    // ═══════════════════════════════════════════════════════════════════
    // REGISTER
    // ═══════════════════════════════════════════════════════════════════

    @Override
    public void register(RegisterRequest registerRequest) {
        UserRequest userRequest = new UserRequest();
        userRequest.setFullName(registerRequest.getFullName());
        userRequest.setEmail(registerRequest.getEmail());
        userRequest.setAddress(registerRequest.getAddress());
        userRequest.setAvatarUrl("https://ui-avatars.com/api/?name=" + registerRequest.getFullName());

        UserResponse userResponse = userClient.createUser(userRequest);

        Credential credential = new Credential();
        credential.setEmail(registerRequest.getEmail());
        credential.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        credential.setUserId(userResponse.getId());
        credential.setRole("USER");
        credentialRepository.save(credential);
        // register không gửi Kafka event nên không cần outbox
    }

    // ═══════════════════════════════════════════════════════════════════
    // LOGOUT ALL DEVICES
    // ═══════════════════════════════════════════════════════════════════

    @Override
    @Transactional // ← THÊM MỚI: ghi outbox
    public void logoutAllDevices(RefreshTokenRequest request) {
        String refreshToken = request.getRefreshToken();
        if (!jwtUtil.isTokenValid(refreshToken)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid token");
        }

        String email = jwtUtil.extractEmail(refreshToken);
        Credential credential = credentialRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        revokeAllRedisSessions(credential.getUserId());

        // TRƯỚC: kafkaTemplate.send("user-logout-all-topic", ...)
        saveOutboxEvent("user-logout-all-topic", credential.getUserId());
    }

    // ═══════════════════════════════════════════════════════════════════
    // FORGOT PASSWORD
    // ═══════════════════════════════════════════════════════════════════

    @Override
    @Transactional // ← THÊM MỚI: ghi outbox — nếu Kafka down, user vẫn nhận được email sau
    public void forgotPassword(ForgotPasswordRequest request) {
        Credential credential = credentialRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Email không tồn tại"));

        String resetToken = jwtUtil.generateResetToken(credential.getEmail());
        ForgotPasswordEvent event = new ForgotPasswordEvent(credential.getEmail(), resetToken);

        // TRƯỚC: kafkaTemplate.send("user-forgot-password-topic", ...) bên ngoài @Transactional
        //        → Nếu crash sau khi method return, event mất → user không nhận được email reset
        // SAU:   ghi vào outbox trong cùng TX → đảm bảo at-least-once delivery
        saveOutboxEvent("user-forgot-password-topic", event);
    }

    // ═══════════════════════════════════════════════════════════════════
    // RESET PASSWORD
    // ═══════════════════════════════════════════════════════════════════

    @Override
    @Transactional // đã có từ trước
    public void resetPassword(ResetPasswordRequest request) {
        String token = request.getToken();
        if (!jwtUtil.isTokenValid(token) || !jwtUtil.isResetToken(token)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Token không hợp lệ hoặc sai loại token");
        }

        String email = jwtUtil.extractEmail(token);
        Credential credential = credentialRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Không tìm thấy người dùng"));

        credential.setPassword(passwordEncoder.encode(request.getNewPassword()));
        credentialRepository.save(credential);

        revokeAllRedisSessions(credential.getUserId());

        // TRƯỚC: kafkaTemplate.send đã nằm trong @Transactional nhưng NGOÀI commit
        //        → nếu commit OK nhưng Kafka fail: các session khác không bị revoke
        // SAU:   outbox đảm bảo event được gửi sau khi TX commit
        saveOutboxEvent("user-logout-all-topic", credential.getUserId());
    }

    // ═══════════════════════════════════════════════════════════════════
    // CHANGE PASSWORD
    // ═══════════════════════════════════════════════════════════════════

    @Override
    @Transactional // đã có từ trước
    public void changePassword(String email, ChangePasswordRequest request) {
        Credential credential = credentialRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Không tìm thấy tài khoản"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), credential.getPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mật khẩu hiện tại không đúng");
        }
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mật khẩu xác nhận không khớp");
        }
        if (passwordEncoder.matches(request.getNewPassword(), credential.getPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Mật khẩu mới không được trùng mật khẩu hiện tại");
        }

        credential.setPassword(passwordEncoder.encode(request.getNewPassword()));
        credentialRepository.save(credential);

        revokeOtherRedisSessions(credential.getUserId(), request.getCurrentSessionId());

        // TRƯỚC: kafkaTemplate.send (giống resetPassword, cùng vấn đề)
        saveOutboxEvent("user-logout-all-topic", credential.getUserId());
    }

    // ═══════════════════════════════════════════════════════════════════
    // PRIVATE HELPERS
    // ═══════════════════════════════════════════════════════════════════

    /**
     * Xây dựng LoginResponse + ghi outbox event "user-login-topic".
     * Phải được gọi trong một @Transactional context.
     */
    private LoginResponse buildLoginResponse(Credential credential) {
        UUID sessionId      = UUID.randomUUID();
        String sessionIdStr = sessionId.toString();

        String accessToken  = jwtUtil.generateAccessToken(
                credential.getEmail(),
                Map.of("userId", credential.getUserId(),
                        "role", credential.getRole(),
                        "sessionId", sessionIdStr));
        String refreshToken = jwtUtil.generateRefreshToken(credential.getEmail(), sessionIdStr);

        AuthSession session = AuthSession.builder()
                .id(sessionId)
                .userId(credential.getUserId())
                .email(credential.getEmail())
                .refreshTokenHash(DigestUtils.sha256Hex(refreshToken))
                .revoked(false)
                .createdAt(LocalDateTime.now())
                .expiresAt(LocalDateTime.now().plusDays(30))
                .build();

        redisTemplate.opsForValue().set(SESSION_KEY_PREFIX + sessionIdStr, session, 30, TimeUnit.DAYS);
        redisTemplate.opsForSet().add(USER_SESSIONS_PREFIX + credential.getUserId(), sessionIdStr);

        // TRƯỚC: kafkaTemplate.send("user-login-topic", ...)
        saveOutboxEvent("user-login-topic", credential.getUserId());

        return LoginResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .role(credential.getRole())
                .sessionId(sessionIdStr)
                .build();
    }

    /**
     * Ghi event vào bảng outbox_events trong cùng DB transaction hiện tại.
     * OutboxEventPublisher sẽ poll và publish lên Kafka sau.
     *
     * @param topic   Kafka topic đích
     * @param payload Object hoặc String sẽ được serialized thành JSON
     */
    private void saveOutboxEvent(String topic, Object payload) {
        String jsonPayload;
            try {
                jsonPayload = objectMapper.writeValueAsString(payload);
            } catch (JsonProcessingException e) {
                log.error("[Outbox] Lỗi serialize payload cho topic={}: {}", topic, e.getMessage());
                throw new RuntimeException("Không thể serialize outbox payload", e);
            }


        OutboxEvent event = OutboxEvent.builder()
                .topic(topic)
                .payload(jsonPayload)
                .build();
        outboxEventRepository.save(event);
        log.debug("[Outbox] Đã lưu event topic={} vào outbox", topic);
    }

    private String recordFailedAttempt(String email) {
        String attemptsKey  = LOGIN_ATTEMPTS_PREFIX + email;
        String lockCountKey = LOGIN_LOCKCOUNT_PREFIX + email;

        Long attempts = redisTemplate.opsForValue().increment(attemptsKey);
        if (attempts == null) return null;

        if (attempts >= MAX_FAILED_ATTEMPTS) {
            Long lockCount = redisTemplate.opsForValue().increment(lockCountKey);
            if (lockCount == null) lockCount = 1L;
            long lockMinutes = lockCount * LOCK_STEP_MINUTES;

            redisTemplate.opsForValue().set(
                    LOGIN_LOCKED_PREFIX + email, "1", lockMinutes, TimeUnit.MINUTES);
            redisTemplate.delete(attemptsKey);
            redisTemplate.expire(lockCountKey, 24, TimeUnit.HOURS);

            log.warn("[BruteForce] Account {} bị khoá {} phút (lần thứ {})", email, lockMinutes, lockCount);
            return "ACCOUNT_LOCKED:" + lockMinutes;
        }
        return null;
    }

    private void revokeAllRedisSessions(Long userId) {

        String userSessionsKey = USER_SESSIONS_PREFIX + userId;

        Set<Object> sessionIds =
                redisTemplate.opsForSet().members(userSessionsKey);

        if (sessionIds == null || sessionIds.isEmpty()) {
            return;
        }

        for (Object id : sessionIds) {

            String sessionKey = SESSION_KEY_PREFIX + id;

            Object raw = redisTemplate.opsForValue().get(sessionKey);

            if (raw == null) {
                continue;
            }

            AuthSession session;

            if (raw instanceof AuthSession authSession) {
                session = authSession;
            } else {
                session = objectMapper.convertValue(raw, AuthSession.class);
            }

            session.setRevoked(true);

            redisTemplate.opsForValue().set(
                    sessionKey,
                    session,
                    REFRESH_TOKEN_EXPIRATION_DAYS,
                    TimeUnit.DAYS
            );
        }
    }

    private void revokeOtherRedisSessions(Long userId, String currentSessionId) {
        String userSessionsKey = USER_SESSIONS_PREFIX + userId;
        Set<Object> sessionIds = redisTemplate.opsForSet().members(userSessionsKey);
        if (sessionIds == null || sessionIds.isEmpty()) return;

        List<String> keysToDelete = sessionIds.stream()
                .map(Object::toString)
                .filter(id -> !id.equals(currentSessionId))
                .map(id -> SESSION_KEY_PREFIX + id)
                .collect(Collectors.toList());

        if (!keysToDelete.isEmpty()) {
            redisTemplate.delete(keysToDelete);
            Object[] othersArray = sessionIds.stream()
                    .filter(id -> !id.toString().equals(currentSessionId))
                    .toArray();
            redisTemplate.opsForSet().remove(userSessionsKey, othersArray);
        }
    }

}