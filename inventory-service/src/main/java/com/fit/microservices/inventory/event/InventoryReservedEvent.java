package com.fit.microservices.inventory.event;

import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
@Builder
public class InventoryReservedEvent {
    private Long orderId;
    private String status;
    private String message;
}
