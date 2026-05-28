package com.fit.microservices.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class PhoneVerifyRequest {

    @NotBlank(message = "Số điện thoại không được để trống")
    @Pattern(
        regexp = "^\\+[1-9]\\d{6,14}$",
        message = "Số điện thoại quốc tế không hợp lệ"
    )
    private String phone;

    @NotBlank(message = "Mã OTP không được để trống")
    @Pattern(regexp = "^[0-9]{6}$", message = "OTP phải là 6 chữ số")
    private String otp;
}
