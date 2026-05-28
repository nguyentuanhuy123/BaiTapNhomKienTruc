package com.fit.microservices.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
@Builder
public class UserRequest {
    @NotBlank(message = "Tên không được để trống")
    @Size(min = 2, max = 100, message = "Tên phải từ 2 đến 100 ký tự")
    private String fullName;

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không hợp lệ")
    private String email;

    private String phone;

    /**
     * Địa chỉ dạng JSON string:
     * {"street":"...","ward":"...","district":"...","city":"..."}
     */
    @NotBlank(message = "Địa chỉ không được để trống")
    private String address;

    private String avatarUrl;
}
