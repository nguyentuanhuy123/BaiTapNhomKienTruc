package com.fit.microservices.flashsale.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FlashSaleCampaign implements Serializable {
    private static final long serialVersionUID = 1L;

    private String id;
    private String name;
    private long startTime;
    private long endTime;
    private String status; // SCHEDULED, ACTIVE, ENDED
    private List<FlashSaleProduct> products = new ArrayList<>();
}
