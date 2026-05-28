package com.fit.microservices.flashsale.service;

import com.fit.microservices.flashsale.model.FlashSaleCampaign;
import com.fit.microservices.flashsale.model.FlashSaleProduct;
import com.hazelcast.core.HazelcastInstance;
import com.hazelcast.map.IMap;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class FlashSaleCampaignService {

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    @Autowired
    private HazelcastInstance hazelcastInstance;

    private static final String CAMPAIGN_REDIS_KEY = "FLASHSALE_CAMPAIGNS";

    public FlashSaleCampaign createCampaign(FlashSaleCampaign campaign) {
        if (campaign.getId() == null) {
            campaign.setId(UUID.randomUUID().toString());
        }
        if (campaign.getStatus() == null) {
            campaign.setStatus("SCHEDULED");
        }
        
        // Save in Redis Hash
        redisTemplate.opsForHash().put(CAMPAIGN_REDIS_KEY, campaign.getId(), campaign);
        
        // If it starts immediately or is already active, pre-warm it!
        long now = System.currentTimeMillis();
        if (campaign.getStartTime() <= now && campaign.getEndTime() > now) {
            campaign.setStatus("ACTIVE");
            redisTemplate.opsForHash().put(CAMPAIGN_REDIS_KEY, campaign.getId(), campaign);
            preWarmCampaign(campaign);
        }
        
        return campaign;
    }

    public List<FlashSaleCampaign> getAllCampaigns() {
        List<Object> values = redisTemplate.opsForHash().values(CAMPAIGN_REDIS_KEY);
        List<FlashSaleCampaign> campaigns = new ArrayList<>();
        for (Object obj : values) {
            if (obj instanceof FlashSaleCampaign) {
                campaigns.add((FlashSaleCampaign) obj);
            }
        }
        
        // Dynamic status check based on current system time
        long now = System.currentTimeMillis();
        for (FlashSaleCampaign camp : campaigns) {
            String oldStatus = camp.getStatus();
            if (now < camp.getStartTime()) {
                camp.setStatus("SCHEDULED");
            } else if (now >= camp.getStartTime() && now < camp.getEndTime()) {
                camp.setStatus("ACTIVE");
                // Pre-warm if transitioning to active
                if (!"ACTIVE".equals(oldStatus)) {
                    preWarmCampaign(camp);
                }
            } else {
                camp.setStatus("ENDED");
                // Clean up and sync back if transitioning from active to ended
                if ("ACTIVE".equals(oldStatus)) {
                    endCampaignAndCleanUp(camp);
                }
            }
            if (!camp.getStatus().equals(oldStatus)) {
                redisTemplate.opsForHash().put(CAMPAIGN_REDIS_KEY, camp.getId(), camp);
            }
        }
        
        return campaigns;
    }

    public FlashSaleCampaign getActiveCampaign() {
        List<FlashSaleCampaign> campaigns = getAllCampaigns();
        return campaigns.stream()
                .filter(c -> "ACTIVE".equals(c.getStatus()))
                .findFirst()
                .orElse(null);
    }

    public void preWarmCampaign(FlashSaleCampaign campaign) {
        IMap<String, Integer> stockMap = hazelcastInstance.getMap("flashsale-stock");
        IMap<String, Object> campaignMap = hazelcastInstance.getMap("flashsale-campaign");
        IMap<String, String> priceMap = hazelcastInstance.getMap("flashsale-prices");

        // Warm up each product stock in Hazelcast RAM
        for (FlashSaleProduct product : campaign.getProducts()) {
            // Only overwrite if not already present or if we want to force refresh
            stockMap.put(product.getProductId(), product.getStock());
            priceMap.put(product.getProductId(), product.getSalePrice().toString());
        }

        // Store campaign duration / end time
        campaignMap.put("end-time", campaign.getEndTime());
        campaignMap.put("campaign-id", campaign.getId());
    }

    /**
     * Reclaim leftover stock and clean up Hazelcast RAM when a campaign expires
     */
    public void endCampaignAndCleanUp(FlashSaleCampaign campaign) {
        IMap<String, Integer> stockMap = hazelcastInstance.getMap("flashsale-stock");
        IMap<String, String> priceMap = hazelcastInstance.getMap("flashsale-prices");
        IMap<String, Object> campaignMap = hazelcastInstance.getMap("flashsale-campaign");

        for (FlashSaleProduct product : campaign.getProducts()) {
            String productId = product.getProductId();
            
            // 1. Fetch remaining stock from Hazelcast RAM
            Integer remainingStock = stockMap.get(productId);
            if (remainingStock == null) {
                remainingStock = 0;
            }

            // 2. Account for actual sold quantity
            int soldQty = Math.max(0, product.getStock() - remainingStock);
            product.setSoldQuantity(soldQty);

            // 3. Write reclaim log or publish event for inventory-service to reclaim remaining stock
            if (remainingStock > 0) {
                System.out.println("🔥 [WRITE-BACK] Reclaiming " + remainingStock + " units for product " + productId + " back to store inventory.");
                
                try {
                    // Back up reclaim quantity to Redis for safety audit
                    redisTemplate.opsForHash().put("FLASHSALE_STOCK_RECLAIM", productId, remainingStock);
                    
                    // Publish reclaim event to Redis Channel or Kafka to update main stock levels in database
                    java.util.Map<String, Object> reclaimEvent = java.util.Map.of(
                        "productId", productId,
                        "reclaimQuantity", remainingStock,
                        "timestamp", System.currentTimeMillis()
                    );
                    redisTemplate.convertAndSend("inventory-reclaim-channel", reclaimEvent);
                } catch (Exception e) {
                    System.err.println("Could not log stock reclaim to Redis: " + e.getMessage());
                }
            }

            // 4. Free up RAM memory by deleting keys
            stockMap.remove(productId);
            priceMap.remove(productId);
        }

        // Clear campaign parameters from RAM
        campaignMap.remove("end-time");
        campaignMap.remove("campaign-id");
        
        System.out.println("✨ [CLEAN-UP] Flash Sale campaign '" + campaign.getName() + "' has successfully ended and Hazelcast RAM has been cleared.");
    }
}
