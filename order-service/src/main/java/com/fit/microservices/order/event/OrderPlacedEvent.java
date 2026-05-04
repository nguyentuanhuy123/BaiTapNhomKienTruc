package com.fit.microservices.order.event;

import com.fit.microservices.order.model.OrderStatus;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class OrderPlacedEvent {
    private Long orderId;
    private String orderNumber;
    private Long userId;
    private List<OrderItem> items;
    private BigDecimal totalPrice;
    @Getter
    @Setter
    @AllArgsConstructor
    @NoArgsConstructor
    @ToString
    public static class OrderItem {
        private String skuCode;
        private Integer quantity;
        private BigDecimal price;
    }
}
