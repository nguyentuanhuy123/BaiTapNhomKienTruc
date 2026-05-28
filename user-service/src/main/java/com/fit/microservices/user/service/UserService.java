package com.fit.microservices.user.service;

import com.fit.microservices.user.dto.UpdateProfileRequest;
import com.fit.microservices.user.dto.UserRequest;
import com.fit.microservices.user.dto.UserResponse;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface UserService {

    UserResponse getUserById(Long id);

    /**
     * Get all users (Admin only)
     */
    List<UserResponse> getAllUsers();

    /**
     * Cập nhật thông tin cá nhân (fullName, phone, address).
     * Email không được thay đổi (identity).
     */
    UserResponse updateProfile(String email, UpdateProfileRequest request);

    /**
     * Upload avatar mới lên S3, xoá avatar cũ nếu có, cập nhật avatarUrl.
     */
    UserResponse updateAvatar(String email, MultipartFile file) throws IOException;
}
