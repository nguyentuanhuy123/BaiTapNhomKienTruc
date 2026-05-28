package com.fit.microservices.flashsale.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FlashSaleProduct implements Serializable {
    private static final long serialVersionUID = 1L;

    private String productId;
    private String name;
    private int stock;
    private int soldQuantity; // 🔥 Số lượng thực tế đã bán thành công
    private BigDecimal salePrice;
}
