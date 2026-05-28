package com.fit.microservices.user.service;

import com.fit.microservices.user.dto.UpdateProfileRequest;
import com.fit.microservices.user.dto.UserRequest;
import com.fit.microservices.user.dto.UserResponse;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

public interface UserService {

    UserResponse getUserById(Long id);

    /**
     * Cập nhật thông tin cá nhân (fullName, phone, address).
     * Email không được thay đổi (identity).
     */
    UserResponse updateProfile(String email, UpdateProfileRequest request);

    /**
     * Upload avatar mới lên S3, xoá avatar cũ nếu có, cập nhật avatarUrl.
     */
    UserResponse updateAvatar(String email, MultipartFile file) throws IOException;
    /**
     * Tạo OTP 6 số, lưu Redis 5 phút, gửi qua Kafka để notification-service gửi SMS.
     */
    void sendPhoneOtp(String email, String phone);

    /**
     * Xác minh OTP, nếu đúng → lưu số điện thoại vào DB.
     * @return UserResponse đã cập nhật
     */
    UserResponse verifyPhoneOtp(String email, String phone, String otp);
}
