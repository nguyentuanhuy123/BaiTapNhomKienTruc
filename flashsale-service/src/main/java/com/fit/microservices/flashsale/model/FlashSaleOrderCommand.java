package com.fit.microservices.flashsale.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FlashSaleOrderCommand implements Serializable {
    private static final long serialVersionUID = 1L;

    private String productId;
    private String userId;
    private int quantity;
}
