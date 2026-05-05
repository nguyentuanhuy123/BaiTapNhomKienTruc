package com.fit.microservices.auth.dto;
import lombok.Data;

@Data
public class ForgotPasswordRequest {
    private String email;
}