package com.fit.microservices.payment.event;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class PaymentCompletedEvent {

    private Long orderId;
    private String paymentId;       // transactionId
    private double amount;

    // ── Thêm mới: thông tin để gửi email ──
    private String paymentMethod;   // "COD" | "VNPAY"
    private String userEmail;
    private String userName;
    private String shippingAddress;
    private List<OrderItem> items;

    @Getter
    @Setter
    @AllArgsConstructor
    @NoArgsConstructor
    public static class OrderItem {
        private String name;
        private int quantity;
        private double price;
        private String size;
        private String color;
    }
}
