package com.fit.microservices.notification.event;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class OrderCompletedEvent {
    private Long orderId;
    private Long userId;
    private String status;
}
