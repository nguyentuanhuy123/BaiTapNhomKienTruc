package com.fit.microservices.auth.service.Impl;

import com.fit.microservices.auth.client.UserClient;
import com.fit.microservices.auth.dto.*;
import com.fit.microservices.auth.model.AuthSession;
import com.fit.microservices.auth.model.Credential;
import com.fit.microservices.auth.repository.CredentialRepository;
import com.fit.microservices.auth.service.AuthService;
import com.fit.microservices.auth.util.JwtUtil;
import lombok.RequiredArgsConstructor;
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
public class AuthServiceImpl implements AuthService {

    private final CredentialRepository credentialRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final UserClient userClient;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    // Sử dụng RedisTemplate thay vì AuthSessionRepository
    private final RedisTemplate<String, Object> redisTemplate;

    // Định nghĩa các Prefix Key cho Redis
    private static final String SESSION_KEY_PREFIX = "session:";
    private static final String USER_SESSIONS_PREFIX = "user:sessions:";
    private static final long REFRESH_TOKEN_EXPIRATION_DAYS = 30;

    private static final String OTP_KEY_PREFIX = "otp:login:";

    @Override
    public String login(LoginRequest request) { // Đổi kiểu trả về thành String để báo "OTP_SENT"
        Credential credential = credentialRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), credential.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        // 1. Tạo mã OTP 6 số ngẫu nhiên
        String otp = String.valueOf((int) (Math.random() * 900000) + 100000);

        // 2. Lưu OTP vào Redis (hết hạn sau 5 phút)
        redisTemplate.opsForValue().set(
                OTP_KEY_PREFIX + request.getEmail(),
                otp,
                5,
                TimeUnit.MINUTES
        );

        // 3. Gửi OTP qua Kafka để Notification Service gửi Email
        Map<String, String> otpEvent = Map.of(
                "email", request.getEmail(),
                "otp", otp
        );
        kafkaTemplate.send("user-otp-topic", otpEvent);

        return "OTP_SENT";
    }

    @Override
    public LoginResponse verifyOtp(OtpVerificationRequest request) {
        String storedOtp = (String) redisTemplate.opsForValue().get(OTP_KEY_PREFIX + request.getEmail());

        if (storedOtp == null || !storedOtp.equals(request.getOtp())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Mã OTP không hợp lệ hoặc đã hết hạn");
        }

        // Xóa OTP sau khi verify thành công
        redisTemplate.delete(OTP_KEY_PREFIX + request.getEmail());

        // Tiếp tục logic tạo Token và Session như cũ
        Credential credential = credentialRepository.findByEmail(request.getEmail()).get();

        UUID sessionId = UUID.randomUUID();
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

        redisTemplate.opsForValue().set("session:" + sessionIdStr, session, 30, TimeUnit.DAYS);
        redisTemplate.opsForSet().add("user:sessions:" + credential.getUserId(), sessionIdStr);

        kafkaTemplate.send("user-login-topic", credential.getUserId().toString());

        return new LoginResponse(accessToken, refreshToken, credential.getRole(), sessionIdStr);
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

        String email = jwtUtil.extractEmail(refreshToken);
        String sessionIdStr = jwtUtil.extractSessionId(refreshToken);

        if (sessionIdStr == null || sessionIdStr.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing session id");
        }

        Credential credential = credentialRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        // Lấy Session từ Redis
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
                Map.of(
                        "userId", credential.getUserId(),
                        "role", credential.getRole(),
                        "sessionId", sessionIdStr
                )
        );

        String newRefreshToken = jwtUtil.generateRefreshToken(credential.getEmail(), sessionIdStr);

        session.setRefreshTokenHash(DigestUtils.sha256Hex(newRefreshToken));
        session.setLastUsedAt(LocalDateTime.now());
        redisTemplate.opsForValue().set(
                SESSION_KEY_PREFIX + sessionIdStr,
                session,
                REFRESH_TOKEN_EXPIRATION_DAYS,
                TimeUnit.DAYS
        );

        return new LoginResponse(newAccessToken, newRefreshToken, credential.getRole(), sessionIdStr);
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
            // Xóa session khỏi Redis
            redisTemplate.delete(SESSION_KEY_PREFIX + sessionIdStr);
            // Xóa sessionId khỏi danh sách của User
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
        kafkaTemplate.send("user-forgot-password-topic", event);
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

        // Lưu mật khẩu mới vào DB
        credential.setPassword(passwordEncoder.encode(request.getNewPassword()));
        credentialRepository.save(credential);

        // Đăng xuất mọi thiết bị trên Redis
        revokeAllRedisSessions(credential.getUserId());

        kafkaTemplate.send("user-logout-all-topic", credential.getUserId().toString());
    }

    /**
     * Hàm phụ trợ: Xóa toàn bộ Session của một User trên Redis
     */
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