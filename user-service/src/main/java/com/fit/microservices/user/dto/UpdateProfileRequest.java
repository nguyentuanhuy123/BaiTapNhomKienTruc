package com.fit.microservices.user.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class UpdateProfileRequest {

    @NotBlank(message = "Tên không được để trống")
    @Size(min = 2, max = 100, message = "Tên phải từ 2 đến 100 ký tự")
    private String fullName;

    /**
     * Địa chỉ dạng JSON string:
     * {"street":"...","ward":"...","district":"...","city":"..."}
     * Frontend serialize trước khi gửi.
     */
    @NotBlank(message = "Địa chỉ không được để trống")
    private String address;
}
