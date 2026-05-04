package com.fit.microservices.payment.event;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class PaymentFailedEvent {
    private Long orderId;
    private String reason;
}
