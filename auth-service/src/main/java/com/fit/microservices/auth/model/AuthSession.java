package com.fit.microservices.auth.model;

import lombok.*;
import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * FIX: Đã xóa @Entity, @Table, @Id, @Column của JPA.
 *
 * LÝ DO: AuthSession chỉ được lưu vào Redis (qua RedisTemplate) —
 * không được persist vào MySQL. Giữ @Entity gây ra 2 vấn đề:
 *   1. JPA/Hibernate cố tạo bảng "auth_session" → DDL fail nếu schema không có.
 *   2. Gây hiểu lầm rằng session được lưu DB, trong khi thực tế không phải.
 *
 * AuthSessionRepository (extends JpaRepository<AuthSession>) cũng đã bị xóa
 * vì nó không được inject ở bất kỳ đâu và không còn có nghĩa sau fix này.
 *
 * Redis serialization: class implements Serializable để RedisTemplate có thể
 * serialize/deserialize object đúng cách.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthSession implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private UUID id;

    private Long userId;

    private String refreshTokenHash;

    private String email;

    private String deviceId;
    private String deviceName;
    private String ipAddress;

    private boolean revoked;

    private LocalDateTime createdAt;
    private LocalDateTime lastUsedAt;
    private LocalDateTime expiresAt;
}
