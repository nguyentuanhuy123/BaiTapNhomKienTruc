package com.fit.microservices.user.outbox;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * THAY ĐỔI SO VỚI PHIÊN BẢN CŨ:
 * ─────────────────────────────────────────────────────────────
 * 1. status: String → OutboxStatus enum
 *    - Tránh typo runtime ("SUCESS" vs "PUBLISHED")
 *    - Type-safe khi query
 *
 * 2. @Index trên (status, created_at)
 *    - Query findTop50PendingSkipLocked() cần index này để không full-scan
 *    - Khi bảng có 10k+ rows, không có index → 100-500ms/query
 *
 * 3. Thêm field publishedAt
 *    - Audit trail: biết event được publish lúc nào
 *
 * 4. @Builder.Default cho status, retryCount, createdAt
 *    - Tránh null khi dùng builder() mà không set các field này
 * ─────────────────────────────────────────────────────────────
 */
@Entity
@Table(
        name = "outbox_events",
        indexes = {
                @Index(name = "idx_user_outbox_status_created", columnList = "status, created_at")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OutboxEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String aggregateId;

    private String eventType;

    @Column(nullable = false, length = 200)
    private String topic;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String payload;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private OutboxStatus status = OutboxStatus.PENDING;

    @Builder.Default
    private Integer retryCount = 0;

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    /** Thời điểm publish thành công lên Kafka */
    private LocalDateTime publishedAt;
}
