package com.fit.microservices.order.service;

import com.fit.microservices.order.dto.AddCartItemRequest;
import com.fit.microservices.order.dto.CartResponse;

public interface CartService {
    CartResponse getCart(Long userId);

    CartResponse addItem(Long userId, AddCartItemRequest request);

    CartResponse updateItemQuantity(Long userId, Long itemId, Integer quantity);

    CartResponse removeItem(Long userId, Long itemId);

    CartResponse clearCart(Long userId);
}
