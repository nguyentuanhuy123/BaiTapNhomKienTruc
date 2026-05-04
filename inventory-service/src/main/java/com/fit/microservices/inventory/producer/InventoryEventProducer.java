package com.fit.microservices.inventory.producer;

import com.fit.microservices.inventory.event.InventoryReservedEvent;
import com.fit.microservices.inventory.event.OrderPlacedEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class InventoryEventProducer {
    private final KafkaTemplate<String, Object> kafkaTemplate;
    public static final String INVENTORY_TOPIC_RESERVED = "inventory-reserved";
    public static final String INVENTORY_TOPIC_FAILED = "inventory-failed";
    public void publishInventoryReserved(Long orderId, String message){
        InventoryReservedEvent inventoryReservedEvent = new InventoryReservedEvent(orderId, "RESERVED" ,message);
        kafkaTemplate.send(INVENTORY_TOPIC_RESERVED, orderId.toString(), inventoryReservedEvent);
    }
    public void publishInventoryFailed(Long orderId, String message){
        InventoryReservedEvent inventoryReservedEvent = new InventoryReservedEvent(orderId, "FAILED" ,message);
        kafkaTemplate.send(INVENTORY_TOPIC_FAILED, orderId.toString(), inventoryReservedEvent);
    }

}
