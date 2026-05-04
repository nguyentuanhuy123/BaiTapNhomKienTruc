package com.fit.microservices.order.service;

import com.fit.microservices.order.dto.AddCartItemRequest;

public interface CartService {
    void addCart(AddCartItemRequest request);
    void deleteFromCart(Long id);
    void clearCart();
}
