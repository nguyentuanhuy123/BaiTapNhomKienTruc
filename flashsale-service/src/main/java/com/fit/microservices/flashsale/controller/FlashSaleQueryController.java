package com.fit.microservices.flashsale.controller;

import com.fit.microservices.flashsale.model.FlashSaleCampaign;
import com.fit.microservices.flashsale.service.FlashSaleCampaignService;
import com.hazelcast.core.HazelcastInstance;
import com.hazelcast.map.IMap;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/flashsale/query")
public class FlashSaleQueryController {

    @Autowired
    private HazelcastInstance hazelcastInstance;

    @Autowired
    private FlashSaleCampaignService campaignService;

    /**
     * Get the currently active Flash Sale campaign (for buyers)
     */
    @GetMapping("/campaign/active")
    public ResponseEntity<FlashSaleCampaign> getActiveCampaign() {
        FlashSaleCampaign active = campaignService.getActiveCampaign();
        if (active == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(active);
    }

    /**
     * Get all campaigns (for admin dashboard / listings)
     */
    @GetMapping("/campaign/all")
    public ResponseEntity<List<FlashSaleCampaign>> getAllCampaigns() {
        List<FlashSaleCampaign> campaigns = campaignService.getAllCampaigns();
        return ResponseEntity.ok(campaigns);
    }

    /**
     * Get Flash Sale product details & stock level (CQRS Query Side)
     */
    @GetMapping("/stock/{productId}")
    public ResponseEntity<?> getStock(@PathVariable String productId) {
        IMap<String, Integer> stockMap = hazelcastInstance.getMap("flashsale-stock");
        Integer stock = stockMap.get(productId);

        if (stock == null) {
            return ResponseEntity.notFound().build();
        }

        Map<String, Object> response = new HashMap<>();
        response.put("productId", productId);
        response.put("currentStock", stock);
        response.put("status", stock > 0 ? "AVAILABLE" : "OUT_OF_STOCK");

        return ResponseEntity.ok(response);
    }

    /**
     * Get the active Flash Sale campaign end time and remaining seconds (CQRS Query Side)
     */
    @GetMapping("/campaign-time")
    public ResponseEntity<?> getCampaignTime() {
        IMap<String, Object> campaignMap = hazelcastInstance.getMap("flashsale-campaign");
        Long endTime = (Long) campaignMap.get("end-time");

        if (endTime == null) {
            // Default initialization if none exists: 4 hours from now
            endTime = System.currentTimeMillis() + (240L * 60 * 1000);
            campaignMap.put("end-time", endTime);
        }

        long remainingSeconds = Math.max(0, (endTime - System.currentTimeMillis()) / 1000);

        Map<String, Object> response = new HashMap<>();
        response.put("endTimeMillis", endTime);
        response.put("remainingSeconds", remainingSeconds);

        return ResponseEntity.ok(response);
    }
}

