package com.fit.microservices.auth.outbox;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Outbox Pattern: thay vì gọi kafkaTemplate.send() trực tiếp trong business logic,
 * ta lưu event vào bảng này trong cùng một DB transaction.
 * OutboxEventPublisher sẽ poll bảng này và publish lên Kafka.
 *
 * Guarantee: nếu DB commit thành công → event CHẮC CHẮN sẽ được publish lên Kafka
 * (dù app crash, Kafka tạm down, v.v.)
 */
@Entity
@Table(name = "outbox_events", indexes = {
    @Index(name = "idx_outbox_status_created", columnList = "status, created_at")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OutboxEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Kafka topic đích, ví dụ: "user-otp-topic" */
    @Column(nullable = false, length = 200)
    private String topic;

    /** JSON payload sẽ gửi lên Kafka */
    @Column(nullable = false, columnDefinition = "TEXT")
    private String payload;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private OutboxStatus status = OutboxStatus.PENDING;

    /** Số lần đã thử publish thất bại */
    @Builder.Default
    private int retryCount = 0;

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    /** Thời điểm publish thành công */
    private LocalDateTime publishedAt;
}
