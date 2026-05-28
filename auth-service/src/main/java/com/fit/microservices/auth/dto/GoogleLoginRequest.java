package com.fit.microservices.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class GoogleLoginRequest {

    /**
     * ID Token trả về từ Google Sign-In (credential từ GSI / @react-oauth/google).
     * Backend xác minh với Google tokeninfo API để lấy email, name, picture.
     */
    @NotBlank(message = "Google ID token không được để trống")
    private String idToken;
}
