package com.fit.microservices.order.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartItemResponse {
    private Long id;
    private String skuCode;
    private Long productId;
    private String name;
    private Double price;
    private String image;
    private Integer quantity;
    private String size;
    private String color;
}
