package com.fit.microservices.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class PhoneOtpRequest {

    /**
     * Số điện thoại đầy đủ gồm mã quốc gia, VD: +84912345678
     * Cho phép: + ký tự đầu, tiếp theo là 7–15 chữ số
     */
    @NotBlank(message = "Số điện thoại không được để trống")
    @Pattern(
        regexp = "^\\+[1-9]\\d{6,14}$",
        message = "Số điện thoại quốc tế không hợp lệ (VD: +84912345678)"
    )
    private String phone;
}
