package com.fit.microservices.inventory.listener;


import com.fit.microservices.inventory.event.OrderCancelEvent;
import com.fit.microservices.inventory.event.OrderPlacedEvent;
import com.fit.microservices.inventory.model.Inventory;
import com.fit.microservices.inventory.producer.InventoryEventProducer;
import com.fit.microservices.inventory.repository.InventoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
@Slf4j
public class OrderEventListener {

    private final InventoryRepository inventoryRepository;
    private final InventoryEventProducer inventoryEventProducer;

    @KafkaListener(
            topics = "orders",
            groupId = "inventory-service-group-v4",
            containerFactory = "orderPlacedEventListenerFactory"
    )
    @Transactional
    public void handleOrderPlacedEvent(OrderPlacedEvent event) {

        log.info("Nhận OrderPlacedEvent: {}", event);

        List<String> skuCodes = event.getItems()
                .stream()
                .map(OrderPlacedEvent.OrderItem::getSkuCode)
                .toList();

        List<Inventory> inventories = inventoryRepository.findBySkuCodeIn(skuCodes);

        if (inventories.size() != skuCodes.size()) {
            log.info("Một số sản phẩm không tồn tại");
            inventoryEventProducer.publishInventoryFailed(
                    event.getOrderId(),
                    "Product not found"
            );
            return;
        }

        Map<String, Inventory> inventoryMap = inventories.stream()
                .collect(Collectors.toMap(Inventory::getSkuCode, i -> i));
        boolean allInStock = event.getItems().stream()
                .allMatch(item -> {
                    Inventory inventory = inventoryMap.get(item.getSkuCode());
                    return inventory.getQuantity() >= item.getQuantity();
                });

        if (!allInStock) {
            log.info("Không đủ hàng cho order {}", event.getOrderId());
            inventoryEventProducer.publishInventoryFailed(
                    event.getOrderId(),
                    "Not enough stock"
            );
            return;
        }
        for (OrderPlacedEvent.OrderItem item : event.getItems()) {
            Inventory inventory = inventoryMap.get(item.getSkuCode());
            inventory.setQuantity(
                    inventory.getQuantity() - item.getQuantity()
            );
        }

        inventoryRepository.saveAll(inventories);
        inventoryEventProducer.publishInventoryReserved(
                event.getOrderId(),
                "Inventory reserved success"
        );
        log.info("Giữ hàng thành công cho order {}", event.getOrderId());
    }


    @KafkaListener(
            topics = "orders_cancelled",
            groupId = "inventory-cancel-group",
            containerFactory = "orderCanceledEventListenerFactory"
    )
    @Transactional
    public void handleOrderCancelledEvent(OrderCancelEvent event) {

        log.info("Nhận OrderCancelledEvent: {}", event);

        List<String> skuCodes = event.getItems()
                .stream()
                .map(OrderCancelEvent.OrderItem::getSkuCode)
                .toList();

        List<Inventory> inventories = inventoryRepository.findBySkuCodeIn(skuCodes);

        Map<String, Inventory> inventoryMap = inventories.stream()
                .collect(Collectors.toMap(Inventory::getSkuCode, i -> i));

        for (OrderCancelEvent.OrderItem item : event.getItems()) {
            Inventory inventory = inventoryMap.get(item.getSkuCode());

            if (inventory == null) {
                log.warn("Không tìm thấy inventory cho sku {}", item.getSkuCode());
                continue;
            }

            inventory.setQuantity(
                    inventory.getQuantity() + item.getQuantity()
            );
        }
        inventoryRepository.saveAll(inventories);
        inventoryEventProducer.publishInventoryFailed(
                event.getOrderId(),
                "Inventory released successfully"
        );
        log.info("Release stock thành công cho order {}", event.getOrderId(),event.getReason());
    }

}

