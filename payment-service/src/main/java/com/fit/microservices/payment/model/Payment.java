package com.fit.microservices.payment.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.apache.kafka.shaded.com.google.protobuf.DescriptorProtos;

import java.math.BigDecimal;
import java.time.LocalDateTime;
@Entity
@Table(
        name = "payments",
        indexes = {
                @Index(name = "idx_payment_txn", columnList = "transactionId", unique = true)
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long orderId;

    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    private PaymentMethod method;

    @Enumerated(EnumType.STRING)
    private PaymentStatus status;

    /** UUID – gửi sang VNPay (vnp_TxnRef) */
    @Column(length = 100, nullable = false, unique = true)
    private String transactionId;

    /** vnp_TransactionNo VNPay trả về */
    @Column(length = 100)
    private String gatewayTransactionId;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String paymentUrl;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = createdAt;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}


