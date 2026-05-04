package com.fit.microservices.produc.dto;

public record UserPrincipal(
        Long userId,
        String email,
        String role
) {}
