package com.fit.microservices.auth.service.Impl; // 🔥 Sửa lỗi gõ thiếu chữ 'p'

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fit.microservices.auth.client.UserClient;
import com.fit.microservices.auth.dto.*;
import com.fit.microservices.auth.model.AuthSession;
import com.fit.microservices.auth.model.Credential;
import com.fit.microservices.auth.repository.CredentialRepository;
import com.fit.microservices.auth.service.AuthService;
import com.fit.microservices.auth.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.codec.digest.DigestUtils;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {

    private final CredentialRepository credentialRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final UserClient userClient;
    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final RedisTemplate<String, Object> redisTemplate;
    private final ObjectMapper objectMapper;

    private static final String SESSION_KEY_PREFIX      = "session:";
    private static final String USER_SESSIONS_PREFIX    = "user:sessions:";
    private static final long   REFRESH_TOKEN_EXPIRATION_DAYS = 30;
    private static final String OTP_KEY_PREFIX          = "otp:login:";
    private static final String TRUSTED_DEVICE_PREFIX   = "trusted:device:";
    private static final long   TRUSTED_DEVICE_EXPIRATION_DAYS = 30;

    // ── Brute-force protection ──────────────────────────────────────────────
    private static final String LOGIN_ATTEMPTS_PREFIX  = "login:attempts:";
    private static final String LOGIN_LOCKED_PREFIX    = "login:locked:";
    private static final String LOGIN_LOCKCOUNT_PREFIX = "login:lockcount:";
    private static final int    MAX_FAILED_ATTEMPTS    = 15;
    // Progressive lock: lockCount × 5 minutes  (1st→5min, 2nd→10min, 3rd→15min …)
    private static final long   LOCK_STEP_MINUTES      = 5;

    // ───────────────────────────────────────────────────────────────────────

    @Override
    public LoginResponse login(LoginRequest request) {

        // ── 1. Check if account is currently locked ──────────────────────
        String lockedKey = LOGIN_LOCKED_PREFIX + request.getEmail();
        if (Boolean.TRUE.equals(redisTemplate.hasKey(lockedKey))) {
            Long remainingSeconds = redisTemplate.getExpire(lockedKey, TimeUnit.SECONDS);
            long remainingMinutes = (remainingSeconds != null && remainingSeconds > 0)
                    ? (remainingSeconds / 60) + 1
                    : LOCK_STEP_MINUTES;
            // Trả về code đặc biệt để FE parse được thời gian còn lại
            throw new ResponseStatusException(HttpStatus.LOCKED,
                    "ACCOUNT_LOCKED:" + remainingMinutes);
        }

        // ── 2. Tìm credential ─────────────────────────────────────────────
        Credential credential = credentialRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED,
                        "Email hoặc mật khẩu không đúng"));

        // ── 3. Kiểm tra mật khẩu ─────────────────────────────────────────
        if (!passwordEncoder.matches(request.getPassword(), credential.getPassword())) {
            // Tăng bộ đếm thất bại và khoá nếu vượt ngưỡng
            String lockMsg = recordFailedAttempt(request.getEmail());
            if (lockMsg != null) {
                throw new ResponseStatusException(HttpStatus.LOCKED, lockMsg);
            }
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,
                    "Email hoặc mật khẩu không đúng");
        }

        // ── 4. Đăng nhập thành công → xoá bộ đếm ─────────────────────────
        redisTemplate.delete(LOGIN_ATTEMPTS_PREFIX + request.getEmail());

        // ── 5. Kiểm tra thiết bị đã tin cậy (Trusted Device) ─────────────
        if (request.getDeviceToken() != null && !request.getDeviceToken().isBlank()) {
            String redisKey = TRUSTED_DEVICE_PREFIX + credential.getUserId()
                    + ":" + request.getDeviceToken();
            Boolean isTrusted = redisTemplate.hasKey(redisKey);

            if (Boolean.TRUE.equals(isTrusted)) {
                redisTemplate.expire(redisKey, TRUSTED_DEVICE_EXPIRATION_DAYS, TimeUnit.DAYS);
                LoginResponse response = buildLoginResponse(credential);
                response.setStatus("SUCCESS");
                return response;
            }
        }

        // ── 6. Gửi OTP ───────────────────────────────────────────────────
        String otp = String.valueOf((int) (Math.random() * 900000) + 100000);
        redisTemplate.opsForValue().set(OTP_KEY_PREFIX + request.getEmail(), otp, 5, TimeUnit.MINUTES);

        try {
            String otpPayload = objectMapper.writeValueAsString(
                    Map.of("email", request.getEmail(), "otp", otp));
            kafkaTemplate.send("user-otp-topic", otpPayload);
        } catch (JsonProcessingException e) {
            log.error("Lỗi khi parse JSON gửi Kafka OTP", e);
        }

        return LoginResponse.builder()
                .status("OTP_SENT")
                .build();
    }

    /**
     * Tăng bộ đếm đăng nhập sai cho email.
     * Nếu đạt MAX_FAILED_ATTEMPTS → khoá tài khoản và trả về chuỗi "ACCOUNT_LOCKED:{minutes}".
     * Chưa đạt → trả về null.
     */
    private String recordFailedAttempt(String email) {
        String attemptsKey  = LOGIN_ATTEMPTS_PREFIX  + email;
        String lockCountKey = LOGIN_LOCKCOUNT_PREFIX + email;

        Long attempts = redisTemplate.opsForValue().increment(attemptsKey);
        redisTemplate.expire(attemptsKey, 1, TimeUnit.HOURS);

        if (attempts != null && attempts >= MAX_FAILED_ATTEMPTS) {
            // Tăng số lần khoá (dùng giá trị trả về của increment để tránh race condition)
            Long lockCount = redisTemplate.opsForValue().increment(lockCountKey);
            if (lockCount == null) lockCount = 1L;
            redisTemplate.expire(lockCountKey, 24, TimeUnit.HOURS);

            long lockMinutes = lockCount * LOCK_STEP_MINUTES; // 5, 10, 15, 20 …

            String lockedKey = LOGIN_LOCKED_PREFIX + email;
            redisTemplate.opsForValue().set(lockedKey, "LOCKED", lockMinutes, TimeUnit.MINUTES);

            // Reset bộ đếm thất bại
            redisTemplate.delete(attemptsKey);

            log.warn("Tài khoản {} bị khoá {} phút (lần khoá thứ {})", email, lockMinutes, lockCount);
            return "ACCOUNT_LOCKED:" + lockMinutes;
        }

        return null; // chưa đến ngưỡng khoá
    }

    // ────────────────────────────────────────────────────────────────────────

    @Override
    public LoginResponse verifyOtp(OtpVerificationRequest request) {
        String storedOtp = (String) redisTemplate.opsForValue().get(OTP_KEY_PREFIX + request.getEmail());

        if (storedOtp == null || !storedOtp.equals(request.getOtp())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Mã OTP không hợp lệ hoặc đã hết hạn");
        }

        redisTemplate.delete(OTP_KEY_PREFIX + request.getEmail());

        Credential credential = credentialRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tài khoản không tồn tại"));

        String deviceToken = UUID.randomUUID().toString();
        String redisKey = TRUSTED_DEVICE_PREFIX + credential.getUserId() + ":" + deviceToken;
        redisTemplate.opsForValue().set(redisKey, "1", TRUSTED_DEVICE_EXPIRATION_DAYS, TimeUnit.DAYS);

        LoginResponse response = buildLoginResponse(credential);
        response.setDeviceToken(deviceToken);
        response.setStatus("SUCCESS");
        return response;
    }

    private LoginResponse buildLoginResponse(Credential credential) {
        UUID sessionId    = UUID.randomUUID();
        String sessionIdStr = sessionId.toString();

        String accessToken = jwtUtil.generateAccessToken(
                credential.getEmail(),
                Map.of("userId", credential.getUserId(), "role", credential.getRole(), "sessionId", sessionIdStr)
        );
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

        kafkaTemplate.send("user-login-topic", credential.getUserId().toString());

        return LoginResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .role(credential.getRole())
                .sessionId(sessionIdStr)
                .build();
    }

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

        String newAccessToken = jwtUtil.generateAccessToken(
                credential.getEmail(),
                Map.of("userId", credential.getUserId(), "role", credential.getRole(), "sessionId", sessionIdStr)
        );
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

    @Override
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
            kafkaTemplate.send("user-logout-topic", session.getUserId().toString());
        }
    }

    @Override
    public void register(RegisterRequest registerRequest) {
        UserRequest userRequest = new UserRequest();
        userRequest.setFullName(registerRequest.getFullName());
        userRequest.setEmail(registerRequest.getEmail());
        userRequest.setPhone(registerRequest.getPhone());
        userRequest.setAddress(registerRequest.getAddress());
        userRequest.setAvatarUrl("https://ui-avatars.com/api/?name=" + registerRequest.getFullName());

        UserResponse userResponse = userClient.createUser(userRequest);

        Credential credential = new Credential();
        credential.setEmail(registerRequest.getEmail());
        credential.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        credential.setUserId(userResponse.getId());
        credential.setRole("USER");

        credentialRepository.save(credential);
    }

    @Override
    public void logoutAllDevices(RefreshTokenRequest request) {
        String refreshToken = request.getRefreshToken();

        if (!jwtUtil.isTokenValid(refreshToken)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid token");
        }

        String email = jwtUtil.extractEmail(refreshToken);
        Credential credential = credentialRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        revokeAllRedisSessions(credential.getUserId());
        kafkaTemplate.send("user-logout-all-topic", credential.getUserId().toString());
    }

    @Override
    public void forgotPassword(ForgotPasswordRequest request) {
        Credential credential = credentialRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Email không tồn tại"));

        String resetToken = jwtUtil.generateResetToken(credential.getEmail());
        ForgotPasswordEvent event = new ForgotPasswordEvent(credential.getEmail(), resetToken);

        try {
            kafkaTemplate.send("user-forgot-password-topic", objectMapper.writeValueAsString(event));
        } catch (JsonProcessingException e) {
            log.error("Lỗi khi parse JSON gửi Kafka Forgot Password", e);
        }
    }

    @Override
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        String token = request.getToken();

        if (!jwtUtil.isTokenValid(token) || !jwtUtil.isResetToken(token)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Token không hợp lệ hoặc sai loại token");
        }

        String email = jwtUtil.extractEmail(token);
        Credential credential = credentialRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy người dùng"));

        credential.setPassword(passwordEncoder.encode(request.getNewPassword()));
        credentialRepository.save(credential);

        revokeAllRedisSessions(credential.getUserId());
        kafkaTemplate.send("user-logout-all-topic", credential.getUserId().toString());
    }

    @Override
    @Transactional
    public void changePassword(String email, ChangePasswordRequest request) {
        Credential credential = credentialRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy tài khoản"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), credential.getPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mật khẩu hiện tại không đúng");
        }

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mật khẩu xác nhận không khớp");
        }

        if (passwordEncoder.matches(request.getNewPassword(), credential.getPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mật khẩu mới không được trùng mật khẩu hiện tại");
        }

        credential.setPassword(passwordEncoder.encode(request.getNewPassword()));
        credentialRepository.save(credential);

        revokeOtherRedisSessions(credential.getUserId(), request.getCurrentSessionId());
        kafkaTemplate.send("user-logout-all-topic", credential.getUserId().toString());
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

    private void revokeAllRedisSessions(Long userId) {
        String userSessionsKey = USER_SESSIONS_PREFIX + userId;
        Set<Object> sessionIds = redisTemplate.opsForSet().members(userSessionsKey);

        if (sessionIds != null && !sessionIds.isEmpty()) {
            List<String> keysToDelete = sessionIds.stream()
                    .map(id -> SESSION_KEY_PREFIX + id.toString())
                    .collect(Collectors.toList());
            redisTemplate.delete(keysToDelete);
        }
        redisTemplate.delete(userSessionsKey);
    }
}