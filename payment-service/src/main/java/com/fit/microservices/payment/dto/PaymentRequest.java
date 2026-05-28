package com.fit.microservices.payment.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class PaymentRequest {

    /**
     * Order ID từ order-service (bắt buộc khi FE gọi từ checkout).
     * Nếu null, service sẽ tự sinh (dùng cho Kafka flow).
     */
    private Long orderId;

    /** "COD" hoặc "VNPAY" */
    private String paymentMethod;

    private BigDecimal amount;

    private String userEmail;
    private String userName;
    private String shippingAddress;

    private List<OrderItem> items;

    @Getter
    @Setter
    @NoArgsConstructor
    public static class OrderItem {
        private String name;
        private int quantity;
        private BigDecimal price;
        private String size;
        private String color;
    }
}