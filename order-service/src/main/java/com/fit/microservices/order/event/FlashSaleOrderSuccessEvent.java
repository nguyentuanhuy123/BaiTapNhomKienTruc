package com.fit.microservices.order.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FlashSaleOrderSuccessEvent implements Serializable {
    private static final long serialVersionUID = 1L;

    private String orderId;
    private String productId;
    private String userId;
    private int quantity;
    private BigDecimal price;
    private String status;
}
