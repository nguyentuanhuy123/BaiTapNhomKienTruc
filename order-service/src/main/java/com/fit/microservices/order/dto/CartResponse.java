package com.fit.microservices.order.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartResponse {
    private Long cartId;
    private Long userId;
    private List<CartItemResponse> items;
    private Integer totalQuantity;
    private Integer totalItems;
}

