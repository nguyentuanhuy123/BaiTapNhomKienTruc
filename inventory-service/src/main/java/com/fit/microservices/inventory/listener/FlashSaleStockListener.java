package com.fit.microservices.inventory.listener;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fit.microservices.inventory.model.Inventory;
import com.fit.microservices.inventory.repository.InventoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class FlashSaleStockListener implements MessageListener {

    private final InventoryRepository inventoryRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    @Transactional
    public void onMessage(Message message, byte[] pattern) {
        String channel = new String(message.getChannel());
        String body = new String(message.getBody());
        log.info("Received Redis message on channel '{}': {}", channel, body);

        try {
            // Redis Pub/Sub body is typically serialized as JSON string with type hints or raw json
            // Let's strip JSON type hints if present, or parse as a Map
            String jsonToParse = body;
            if (body.startsWith("[")) {
                // If GenericJackson2JsonRedisSerializer added type annotations
                // e.g. ["java.util.HashMap", {"productId": "...", "reclaimQuantity": 10}]
                List<?> list = objectMapper.readValue(body, List.class);
                if (list.size() > 1 && list.get(1) instanceof Map) {
                    jsonToParse = objectMapper.writeValueAsString(list.get(1));
                }
            }

            Map<?, ?> event = objectMapper.readValue(jsonToParse, Map.class);
            String productId = (String) event.get("productId");
            
            if (productId == null) {
                log.warn("Null productId in event: {}", event);
                return;
            }

            // In inventory-service, the product SKU code matches the productId of the flash sale
            Inventory inventory = inventoryRepository.findBySkuCodeIn(List.of(productId))
                    .stream()
                    .findFirst()
                    .orElse(null);

            if (inventory == null) {
                log.warn("Inventory record not found for SKU: {}", productId);
                return;
            }

            if ("inventory-deduct-channel".equals(channel)) {
                Number deductQtyNum = (Number) event.get("deductQuantity");
                if (deductQtyNum != null) {
                    int deductQty = deductQtyNum.intValue();
                    int originalQty = inventory.getQuantity();
                    // Deduct DB stock (prevent negative stock)
                    int newQty = Math.max(0, originalQty - deductQty);
                    inventory.setQuantity(newQty);
                    inventoryRepository.save(inventory);
                    log.info("🔥 [DEDUCT-SUCCESS] Deducted {} units from SKU: {}. Database stock: {} -> {}", deductQty, productId, originalQty, newQty);
                }
            } else if ("inventory-reclaim-channel".equals(channel)) {
                Number reclaimQtyNum = (Number) event.get("reclaimQuantity");
                if (reclaimQtyNum != null) {
                    int reclaimQty = reclaimQtyNum.intValue();
                    int originalQty = inventory.getQuantity();
                    // Reclaim remaining stock back to database
                    int newQty = originalQty + reclaimQty;
                    inventory.setQuantity(newQty);
                    inventoryRepository.save(inventory);
                    log.info("✨ [RECLAIM-SUCCESS] Reclaimed {} units back to SKU: {}. Database stock: {} -> {}", reclaimQty, productId, originalQty, newQty);
                }
            }

        } catch (IOException e) {
            log.error("Failed to parse Flash Sale stock event", e);
        }
    }
}
