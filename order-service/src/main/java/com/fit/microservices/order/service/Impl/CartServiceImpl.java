package com.fit.microservices.order.service.Impl;

import com.fit.microservices.order.dto.AddCartItemRequest;
import com.fit.microservices.order.event.OrderPlacedEvent;
import com.fit.microservices.order.model.Cart;
import com.fit.microservices.order.model.CartItem;
import com.fit.microservices.order.repository.CartItemRepository;
import com.fit.microservices.order.repository.CartRepository;
import com.fit.microservices.order.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;

@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;

    @Override
    public void addCart(AddCartItemRequest request) {
        Cart cart = cartRepository.findByUserId(request.getUserId())
                .orElseGet(()->{
                    Cart newCart = new Cart();
                    newCart.setUserId(request.getUserId());
                    newCart.setItems(new ArrayList<>());
                    return newCart;
                });
        CartItem existingItem = cart.getItems().stream()
                .filter(item -> item.getSkuCode().equals(request.getSkuCode()))
                .findFirst()
                .orElse(null);
        if (existingItem != null) {
            existingItem.setQuantity(
                    existingItem.getQuantity() + request.getQuantity()
            );
        } else {
            CartItem newItem = new CartItem();
            newItem.setSkuCode(request.getSkuCode());
            newItem.setQuantity(request.getQuantity());
            newItem.setCart(cart);
            cart.getItems().add(newItem);
        }
        cartRepository.save(cart);
    }

    @Override
    public void deleteFromCart(Long id) {
        CartItem cartItem = cartItemRepository.findById(id).orElse(null);
        if (cartItem.getQuantity() > 1) {
            cartItem.setQuantity(cartItem.getQuantity() - 1);
            cartItemRepository.save(cartItem);
        } else {
            cartItemRepository.delete(cartItem);
        }
    }

    @Override
    public void clearCart() {
        cartRepository.deleteAll();
    }
}
