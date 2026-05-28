package com.fit.microservices.flashsale.controller;

import com.fit.microservices.flashsale.event.FlashSaleOrderSuccessEvent;
import com.fit.microservices.flashsale.model.FlashSaleCampaign;
import com.fit.microservices.flashsale.model.FlashSaleOrderCommand;
import com.fit.microservices.flashsale.service.FlashSaleCampaignService;
import com.hazelcast.core.HazelcastInstance;
import com.hazelcast.map.IMap;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/flashsale/command")
public class FlashSaleCommandController {

    @Autowired
    private HazelcastInstance hazelcastInstance;

    @Autowired
    private KafkaTemplate<String, Object> kafkaTemplate;

    @Autowired
    private FlashSaleCampaignService campaignService;

    private static final String KAFKA_TOPIC = "flash-sale-orders";

    /**
     * Create/Schedule a Flash Sale Campaign
     */
    @PostMapping("/campaign/create")
    public ResponseEntity<FlashSaleCampaign> createCampaign(@RequestBody FlashSaleCampaign campaign) {
        FlashSaleCampaign created = campaignService.createCampaign(campaign);
        return ResponseEntity.ok(created);
    }

    /**
     * Warm up / Initialize stock in the Virtual Space (Hazelcast RAM)
     */
    @PostMapping("/init-stock")
    public ResponseEntity<String> initStock(@RequestParam String productId, @RequestParam int quantity) {
        IMap<String, Integer> stockMap = hazelcastInstance.getMap("flashsale-stock");
        stockMap.put(productId, quantity);

        // Auto initialize campaign time to 4 hours if not already set
        IMap<String, Long> campaignMap = hazelcastInstance.getMap("flashsale-campaign");
        if (!campaignMap.containsKey("end-time")) {
            long endTimeMillis = System.currentTimeMillis() + (240L * 60 * 1000); // 4 hours default
            campaignMap.put("end-time", endTimeMillis);
        }

        return ResponseEntity.ok("Successfully warmed up stock in Space-Based RAM: " + quantity + " units");
    }

    /**
     * Set active campaign duration in minutes (Stored in RAM)
     */
    @PostMapping("/set-campaign-time")
    public ResponseEntity<String> setCampaignTime(@RequestParam int durationMinutes) {
        IMap<String, Long> campaignMap = hazelcastInstance.getMap("flashsale-campaign");
        long endTimeMillis = System.currentTimeMillis() + ((long) durationMinutes * 60 * 1000);
        campaignMap.put("end-time", endTimeMillis);
        return ResponseEntity.ok("Successfully updated campaign end time to " + durationMinutes + " minutes from now.");
    }

    /**
     * Checkout Endpoint (Command Side of CQRS)
     */
    @PostMapping("/checkout")
    public ResponseEntity<?> checkout(@RequestBody FlashSaleOrderCommand command) {
        IMap<String, Integer> stockMap = hazelcastInstance.getMap("flashsale-stock");
        IMap<String, String> priceMap = hazelcastInstance.getMap("flashsale-prices");

        String productId = command.getProductId();
        int reqQty = command.getQuantity();

        // Lock the product key in Hazelcast to guarantee extreme consistency
        stockMap.lock(productId);
        try {
            Integer currentStock = stockMap.get(productId);
            if (currentStock == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Product is not active in Flash Sale");
            }

            if (currentStock < reqQty) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Sold out / Insufficient stock! Available: " + currentStock);
            }

            // Atomically decrement stock in memory
            int newStock = currentStock - reqQty;
            stockMap.put(productId, newStock);

            // Fetch the campaign-configured sale price from Hazelcast RAM (synced during pre-warm)
            String priceStr = priceMap.get(productId);
            BigDecimal salePrice = priceStr != null ? new BigDecimal(priceStr) : new BigDecimal("99.99");

            // Generate asynchronous order event
            String orderId = UUID.randomUUID().toString();
            FlashSaleOrderSuccessEvent successEvent = new FlashSaleOrderSuccessEvent(
                    orderId,
                    productId,
                    command.getUserId(),
                    reqQty,
                    salePrice,
                    "SUCCESS"
            );

            // Shave the traffic: Publish to Kafka and return immediately
            kafkaTemplate.send(KAFKA_TOPIC, productId, successEvent);

            return ResponseEntity.status(HttpStatus.ACCEPTED).body(successEvent);

        } finally {
            stockMap.unlock(productId);
        }
    }
}

