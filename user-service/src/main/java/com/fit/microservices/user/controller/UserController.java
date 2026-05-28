package com.fit.microservices.user.controller;

import com.fit.microservices.user.dto.*;
import com.fit.microservices.user.model.User;
import com.fit.microservices.user.repository.UserRepository;
import com.fit.microservices.user.service.UserService;
import com.fit.microservices.user.service.UserStatusService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Tag(name = "User API", description = "Operations related to users")
@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final UserRepository userRepository;
    private final UserStatusService userStatusService;

    // ─── Existing endpoints ──────────────────────────────────────────────────────

    @Operation(summary = "Get user by ID")
    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @Operation(summary = "Get current authenticated user")
    @GetMapping("/me")
    public ResponseEntity<UserResponse> me(@RequestHeader("X-User-Email") String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(new UserResponse(user));
    }

    @Operation(summary = "Create new user (internal — called by auth-service)")
    @PostMapping
    public ResponseEntity<UserResponse> createUser(@Valid @RequestBody UserRequest request) {
        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .address(request.getAddress())
                .avatarUrl(request.getAvatarUrl() != null
                        ? request.getAvatarUrl()
                        : "https://example.com/default-avatar.png")
                .build();
        userRepository.save(user);
        return new ResponseEntity<>(new UserResponse(user), HttpStatus.CREATED);
    }

    @Operation(summary = "Check if a user is online")
    @GetMapping("/{id}/online-status")
    public ResponseEntity<Map<String, Object>> checkUserOnline(@PathVariable Long id) {
        boolean isOnline = userStatusService.isUserOnline(id);
        Map<String, Object> response = new HashMap<>();
        response.put("userId", id);
        response.put("isOnline", isOnline);
        response.put("status", isOnline ? "ONLINE" : "OFFLINE");
        return ResponseEntity.ok(response);
    }

    // ─── New: updateProfile ──────────────────────────────────────────────────────

    /**
     * PUT /api/user/me/profile
     * Header: X-User-Email (set bởi API Gateway / auth filter)
     * Body:   { fullName, phone, address }
     */
    @Operation(summary = "Update profile info (fullName, phone, address)")
    @PutMapping("/me/profile")
    public ResponseEntity<UserResponse> updateProfile(
            @RequestHeader("X-User-Email") String email,
            @Valid @RequestBody UpdateProfileRequest request) {

        UserResponse updated = userService.updateProfile(email, request);
        return ResponseEntity.ok(updated);
    }

    // ─── New: updateAvatar ───────────────────────────────────────────────────────

    /**
     * PATCH /api/user/me/avatar
     * Header: X-User-Email
     * Body:   multipart/form-data  field "file"
     *
     * Dùng PATCH thay vì PUT vì chỉ thay đổi 1 trường (avatarUrl).
     */
    @Operation(summary = "Upload new avatar to AWS S3")
    @PatchMapping(value = "/me/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UserResponse> updateAvatar(
            @RequestHeader("X-User-Email") String email,
            @RequestPart("file") MultipartFile file) throws IOException {

        UserResponse updated = userService.updateAvatar(email, file);
        return ResponseEntity.ok(updated);
    }
    // ─── Phone OTP ───────────────────────────────────────────────────────────────

    /**
     * POST /api/user/me/phone/send-otp
     * Body: { "phone": "+84912345678" }
     * Tạo OTP, lưu Redis 5 phút, gửi Kafka → notification-service gửi SMS.
     */
    @Operation(summary = "Send OTP to verify a new phone number")
    @PostMapping("/me/phone/send-otp")
    public ResponseEntity<Map<String, String>> sendPhoneOtp(
            @RequestHeader("X-User-Email") String email,
            @Valid @RequestBody PhoneOtpRequest request) {

        userService.sendPhoneOtp(email, request.getPhone());
        return ResponseEntity.ok(Map.of(
                "message", "Mã OTP đã được gửi tới " + request.getPhone()
        ));
    }

    /**
     * POST /api/user/me/phone/verify-otp
     * Body: { "phone": "+84912345678", "otp": "123456" }
     * Xác minh OTP → cập nhật phone trong DB.
     */
    @Operation(summary = "Verify OTP and save phone number")
    @PostMapping("/me/phone/verify-otp")
    public ResponseEntity<UserResponse> verifyPhoneOtp(
            @RequestHeader("X-User-Email") String email,
            @Valid @RequestBody PhoneVerifyRequest request) {

        UserResponse updated = userService.verifyPhoneOtp(
                email, request.getPhone(), request.getOtp());
        return ResponseEntity.ok(updated);
    }
}
