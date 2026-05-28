package com.fit.microservices.user.dto;

import com.fit.microservices.user.model.User;
import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class UserResponse {
    private Long id;
    private String fullName;
    private String email;
    private String phone;
    private String address;
    private String avatarUrl;
    private LocalDateTime createdAt;
    private String role;
    private String status;

    public UserResponse(User user) {
        this.id = user.getId();
        this.fullName = user.getFullName();
        this.email = user.getEmail();
        this.phone = user.getPhone();
        this.address = user.getAddress();
        this.avatarUrl = user.getAvatarUrl();
        this.createdAt = user.getCreatedAt();
        this.role = user.getRole() != null ? user.getRole() : "USER";
        this.status = "Active"; // Default status
    }
}

