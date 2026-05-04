package com.fit.microservices.notification.event;

import lombok.*;

import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString
public class OrderCancelledEvent {
    private Long orderId;
    private Long userId;
    private List<OrderItem> items;
    private String reason;
    @AllArgsConstructor
    @NoArgsConstructor
    @Getter
    @Setter
    @ToString
    public static class OrderItem {
        private String skuCode;
        private Integer quantity;
    }
}
