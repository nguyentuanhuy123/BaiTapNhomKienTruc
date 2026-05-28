package com.fit.microservices.flashsale.scheduler;

import com.fit.microservices.flashsale.service.FlashSaleCampaignService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class FlashSaleScheduler {

    @Autowired
    private FlashSaleCampaignService campaignService;

    /**
     * Run every 15 seconds to check campaign transition states and pre-warm stocks
     */
    @Scheduled(fixedRate = 15000)
    public void checkAndPreWarmCampaigns() {
        // Calling getAllCampaigns updates status dynamically and triggers pre-warming
        campaignService.getAllCampaigns();
    }
}
