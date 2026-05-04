package com.fit.microservices.order.dto;

public record UserPrincipal(
        Long userId,
        String role
) {}
