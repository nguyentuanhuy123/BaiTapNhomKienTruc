package com.fit.microservices.order.mapper;

import com.fit.microservices.order.dto.CartItemResponse;
import com.fit.microservices.order.dto.CartResponse;
import com.fit.microservices.order.model.Cart;

import java.util.Collections;
import java.util.List;

public final class CartMapper {
    private CartMapper() {
    }

    public static CartResponse toResponse(Cart cart) {
        if (cart == null) {
            return CartResponse.builder()
                    .items(Collections.emptyList())
                    .totalItems(0)
                    .totalQuantity(0)
                    .build();
        }

        List<CartItemResponse> items = cart.getItems() == null
                ? Collections.emptyList()
                : cart.getItems().stream()
                .map(i -> CartItemResponse.builder()
                        .id(i.getId())
                        .skuCode(i.getSkuCode())
                        .productId(i.getProductId())
                        .name(i.getName())
                        .price(i.getPrice())
                        .image(i.getImage())
                        .quantity(i.getQuantity())
                        .size(i.getSize())
                        .color(i.getColor())
                        .build())
                .toList();

        int totalQuantity = items.stream()
                .map(CartItemResponse::getQuantity)
                .filter(q -> q != null)
                .mapToInt(Integer::intValue)
                .sum();

        return CartResponse.builder()
                .cartId(cart.getId())
                .userId(cart.getUserId())
                .items(items)
                .totalItems(items.size())
                .totalQuantity(totalQuantity)
                .build();
    }
}
