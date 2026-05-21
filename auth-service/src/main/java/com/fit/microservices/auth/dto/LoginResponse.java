package com.fit.microservices.auth.dto;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder // Thêm Builder để tạo object không cần truyền đủ mọi field
public class LoginResponse {
    private String accessToken;
    private String refreshToken;
    private String role;
    private String sessionId;
    private String deviceToken;
    private String status; // Ví dụ: "OTP_SENT" hoặc "SUCCESS"
}