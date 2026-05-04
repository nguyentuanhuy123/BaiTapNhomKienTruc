package com.fit.microservices.order.event;

import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
@ToString
@Builder
public class InventoryFailedEvent {
    private Long orderId;
    private String status;
    private String message;
}
