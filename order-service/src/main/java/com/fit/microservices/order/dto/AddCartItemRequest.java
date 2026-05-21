package com.fit.microservices.order.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class AddCartItemRequest {
    private String skuCode;
    private Long productId;
    private String name;
    private Double price;
    private String image;
    private Integer quantity;
    private String size;
    private String color;
}
