package com.fit.microservices.auth.dto;

import lombok.Data;

@Data
public class OtpVerificationRequest {
    private String email;
    private String otp;
    // Thông tin thiết bị để tạo session sau khi verify thành công
    private String deviceId;
    private String deviceName;
    private String ipAddress;
}