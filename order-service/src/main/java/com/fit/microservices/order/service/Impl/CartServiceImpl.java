package com.fit.microservices.order.service.Impl;

import com.fit.microservices.order.dto.AddCartItemRequest;
import com.fit.microservices.order.dto.CartResponse;
import com.fit.microservices.order.mapper.CartMapper;
import com.fit.microservices.order.model.Cart;
import com.fit.microservices.order.model.CartItem;
import com.fit.microservices.order.repository.CartItemRepository;
import com.fit.microservices.order.repository.CartRepository;
import com.fit.microservices.order.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Locale;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;

    @Override
    @Transactional(readOnly = true)
    public CartResponse getCart(Long userId) {
        Cart cart = cartRepository.findByUserId(userId).orElseGet(() -> {
            Cart newCart = new Cart();
            newCart.setUserId(userId);
            newCart.setItems(new ArrayList<>());
            return newCart;
        });
        // Do not force-create a cart in DB on GET; only map the current state.
        return CartMapper.toResponse(cart);
    }

    @Override
    @Transactional
    public CartResponse addItem(Long userId, AddCartItemRequest request) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseGet(() -> {
                    Cart newCart = new Cart();
                    newCart.setUserId(userId);
                    newCart.setItems(new ArrayList<>());
                    return newCart;
                });

        CartItem existingItem = cart.getItems().stream()
                .filter(item -> isSameVariant(item, request))
                .findFirst()
                .orElse(null);

        if (existingItem != null) {
            int addQty = request.getQuantity() == null ? 0 : request.getQuantity();
            existingItem.setQuantity((existingItem.getQuantity() == null ? 0 : existingItem.getQuantity()) + addQty);
            mergeItemDetails(existingItem, request);
        } else {
            CartItem newItem = new CartItem();
            newItem.setSkuCode(request.getSkuCode());
            newItem.setProductId(request.getProductId());
            newItem.setName(request.getName());
            newItem.setPrice(request.getPrice());
            newItem.setImage(request.getImage());
            newItem.setQuantity(request.getQuantity() == null ? 1 : request.getQuantity());
            newItem.setSize(request.getSize());
            newItem.setColor(request.getColor());
            newItem.setCart(cart);
            cart.getItems().add(newItem);
        }

        Cart saved = cartRepository.save(cart);
        return CartMapper.toResponse(saved);
    }

    private void mergeItemDetails(CartItem item, AddCartItemRequest request) {
        if (item.getProductId() == null && request.getProductId() != null) {
            item.setProductId(request.getProductId());
        }
        if (item.getName() == null && request.getName() != null) {
            item.setName(request.getName());
        }
        if (item.getPrice() == null && request.getPrice() != null) {
            item.setPrice(request.getPrice());
        }
        if (item.getImage() == null && request.getImage() != null) {
            item.setImage(request.getImage());
        }
    }

    private boolean isSameVariant(CartItem item, AddCartItemRequest request) {
        return Objects.equals(normalizeKey(item.getSkuCode()), normalizeKey(request.getSkuCode()))
                && Objects.equals(normalizeKey(item.getSize()), normalizeKey(request.getSize()))
                && Objects.equals(normalizeKey(item.getColor()), normalizeKey(request.getColor()));
    }

    private String normalizeKey(String value) {
        return value == null ? null : value.trim().toLowerCase(Locale.ROOT);
    }

    @Override
    @Transactional
    public CartResponse updateItemQuantity(Long userId, Long itemId, Integer quantity) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Cart not found for userId=" + userId));

        CartItem cartItem = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("CartItem not found id=" + itemId));

        // Ensure item belongs to user's cart
        if (cartItem.getCart() == null || cartItem.getCart().getId() == null || !cartItem.getCart().getId().equals(cart.getId())) {
            throw new IllegalArgumentException("Item does not belong to this cart");
        }

        if (quantity == null || quantity <= 0) {
            // Keep both DB and in-memory relationship in sync
            if (cart.getItems() != null) {
                cart.getItems().removeIf(i -> i.getId() != null && i.getId().equals(cartItem.getId()));
            }
            cartItemRepository.delete(cartItem);
            cartItemRepository.flush();
        } else {
            cartItem.setQuantity(quantity);
            cartItemRepository.save(cartItem);
        }

        // Reload cart with a clean persistence context view
        cartRepository.flush();
        Cart refreshed = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Cart not found after update"));
        return CartMapper.toResponse(refreshed);
    }

    @Override
    @Transactional
    public CartResponse removeItem(Long userId, Long itemId) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Cart not found for userId=" + userId));

        CartItem cartItem = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("CartItem not found id=" + itemId));

        if (cartItem.getCart() == null || cartItem.getCart().getId() == null || !cartItem.getCart().getId().equals(cart.getId())) {
            throw new IllegalArgumentException("Item does not belong to this cart");
        }

        // Keep both DB and in-memory relationship in sync
        if (cart.getItems() != null) {
            cart.getItems().removeIf(i -> i.getId() != null && i.getId().equals(cartItem.getId()));
        }
        cartItemRepository.delete(cartItem);
        cartItemRepository.flush();

        cartRepository.flush();
        Cart refreshed = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Cart not found after delete"));
        return CartMapper.toResponse(refreshed);
    }

    @Override
    @Transactional
    public CartResponse clearCart(Long userId) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseGet(() -> {
                    Cart newCart = new Cart();
                    newCart.setUserId(userId);
                    newCart.setItems(new ArrayList<>());
                    return cartRepository.save(newCart);
                });

        if (cart.getItems() != null) {
            cart.getItems().clear();
        }
        Cart saved = cartRepository.save(cart);
        return CartMapper.toResponse(saved);
    }
}
