package com.fit.microservices.order.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PaymentRequestedEvent {
    private Long orderId;
    private Long userId;
    private BigDecimal amount;
    private String paymentMethod;
}
