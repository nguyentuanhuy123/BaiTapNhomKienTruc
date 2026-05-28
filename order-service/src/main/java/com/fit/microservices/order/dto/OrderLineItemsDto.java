package com.fit.microservices.order.dto;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OrderLineItemsDto {
    private Long productId;
    private String skuCode;
    private String color;
    private String size;
    private Integer quantity;
}
