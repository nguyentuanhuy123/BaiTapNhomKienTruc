package com.fit.microservices.order.event;
import lombok.*;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class PaymentCompletedEvent {
    private Long orderId;
    private String paymentId;
    private double amount;
}
