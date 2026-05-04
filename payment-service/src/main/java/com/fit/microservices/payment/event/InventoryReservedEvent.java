package com.fit.microservices.payment.event;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class InventoryReservedEvent {
    private Long orderId;
    private String status;
    private String message;
}
