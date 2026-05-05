package com.fit.microservices.auth.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "auth_session")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class AuthSession {

    @Id
    private UUID id;

    private Long userId;

    @Column(nullable = false, unique = true, length = 64)
    private String refreshTokenHash;

    @Column(nullable = false)
    private String email;

    private String deviceId;
    private String deviceName;
    private String ipAddress;

    private boolean revoked;

    private LocalDateTime createdAt;
    private LocalDateTime lastUsedAt;
    private LocalDateTime expiresAt;
}