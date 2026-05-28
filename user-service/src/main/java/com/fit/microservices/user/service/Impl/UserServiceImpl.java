package com.fit.microservices.user.service.Impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fit.microservices.user.dto.UpdateProfileRequest;
import com.fit.microservices.user.dto.UserResponse;
import com.fit.microservices.user.model.User;
import com.fit.microservices.user.outbox.UserOutboxEventRepository;
import com.fit.microservices.user.repository.UserRepository;
import com.fit.microservices.user.service.S3Service;
import com.fit.microservices.user.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;
import java.security.SecureRandom;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import com.fit.microservices.user.outbox.OutboxEvent;
import com.fit.microservices.user.outbox.OutboxEventRepository;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final S3Service s3Service;
    private final RedisTemplate<String, Object> redisTemplate;
    private final ObjectMapper objectMapper;


    private static final String PHONE_OTP_PREFIX = "otp:phone:";
    private static final long   OTP_TTL_MINUTES  = 5;
    private static final String PHONE_OTP_TOPIC  = "user-phone-otp-topic";

    private final UserOutboxEventRepository outboxEventRepository;

    // ─── Existing ────────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found: " + id));
        return toResponse(user);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public UserResponse updateProfile(String email, UpdateProfileRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));

        user.setFullName(request.getFullName());
        user.setAddress(request.getAddress());
        // Phone KHÔNG cập nhật ở đây — chỉ qua flow OTP riêng

        return toResponse(userRepository.save(user));
    }

    @Override
    public UserResponse updateAvatar(String email, MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File ảnh không được để trống");
        }
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("Chỉ chấp nhận file ảnh (image/*)");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));

        s3Service.deleteIfBucketUrl(user.getAvatarUrl());
        String newAvatarUrl = s3Service.uploadAvatar(file, user.getId());
        user.setAvatarUrl(newAvatarUrl);

        return toResponse(userRepository.save(user));
    }

    // ─── Phone OTP ────────────────────────────────────────────────────────────────

    @Override
    public void sendPhoneOtp(String email, String phone) {
        // Kiểm tra user tồn tại
        userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Người dùng không tồn tại"));

        // Kiểm tra số điện thoại đã được dùng bởi người khác chưa
        userRepository.findByPhone(phone).ifPresent(existing -> {
            if (!existing.getEmail().equals(email)) {
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT, "Số điện thoại này đã được liên kết với tài khoản khác");
            }
        });

        // Tạo OTP 6 chữ số
        String otp = generateOtp();

        // Lưu vào Redis: key = "otp:phone:{email}:{phone}", TTL = 5 phút
        String redisKey = PHONE_OTP_PREFIX + email + ":" + phone;
        redisTemplate.opsForValue().set(redisKey, otp, OTP_TTL_MINUTES, TimeUnit.MINUTES);

        // Dùng Outbox Pattern thay vì gọi kafkaTemplate trực tiếp.
        // Lý do: sendPhoneOtp() chạy trong @Transactional — nếu gọi Kafka trực tiếp
        // mà Kafka down sau khi DB commit, SMS OTP sẽ bị mất vĩnh viễn.
        // Ghi vào outbox_events trong cùng TX → OutboxPublisher sẽ publish sau.
        try {
            Map<String, String> payload = Map.of(
                    "phone", phone,
                    "otp",   otp,
                    "email", email
            );
            OutboxEvent outboxEvent = OutboxEvent.builder()
                    .topic(PHONE_OTP_TOPIC)
                    .payload(objectMapper.writeValueAsString(payload))
                    .build();
            outboxEventRepository.save(outboxEvent);
        } catch (JsonProcessingException e) {
            log.error("[PhoneOTP] Lỗi serialize payload outbox: {}", e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Không thể gửi OTP, vui lòng thử lại");
        }

        log.info("[PhoneOTP] Đã gửi OTP tới {} cho user {}", phone, email);
    }

    @Override
    public UserResponse verifyPhoneOtp(String email, String phone, String otp) {
        String redisKey = PHONE_OTP_PREFIX + email + ":" + phone;
        Object storedOtp = redisTemplate.opsForValue().get(redisKey);

        if (storedOtp == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Mã OTP đã hết hạn hoặc chưa được gửi");
        }
        if (!storedOtp.toString().equals(otp)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Mã OTP không đúng");
        }

        // OTP hợp lệ → lưu số điện thoại vào DB
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));
        user.setPhone(phone);
        User saved = userRepository.save(user);

        // Xoá OTP khỏi Redis
        redisTemplate.delete(redisKey);

        log.info("[PhoneOTP] Xác minh thành công, đã lưu phone {} cho user {}", phone, email);
        return toResponse(saved);
    }


    // ─── Helpers ─────────────────────────────────────────────────────────────────

    private String generateOtp() {
        SecureRandom random = new SecureRandom();
        int code = 100000 + random.nextInt(900000); // 100000 – 999999
        return String.valueOf(code);
    }

    private UserResponse toResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .address(user.getAddress())
                .avatarUrl(user.getAvatarUrl())
                .createdAt(user.getCreatedAt())
                .role("USER")
                .status("Active")
                .build();
    }
}
