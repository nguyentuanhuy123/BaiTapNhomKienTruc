package com.fit.microservices.order.event;

import lombok.*;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class OrderCompletedEvent {
    private Long orderId;
    private Long userId;
    private String status;
}
