package com.fit.microservices.order.controller;

import com.fit.microservices.order.dto.AddCartItemRequest;
import com.fit.microservices.order.repository.CartRepository;
import com.fit.microservices.order.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {
    private  final CartService cartService;

    @PreAuthorize("hasRole('USER')")
    @PostMapping("/add")
    public ResponseEntity<String> addToCart(
            @RequestBody AddCartItemRequest request
            ) {
        cartService.addCart(request);
        return ResponseEntity.ok("Added to cart");
    }
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteFromCart(
            @PathVariable Long id
    ){
        cartService.deleteFromCart(id);
        return ResponseEntity.ok("Deleted from cart");
    }
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    @DeleteMapping("/delete")
    public ResponseEntity<String> deleteFromCart(){
        cartService.clearCart();
        return ResponseEntity.ok("Cleared all cart");
    }
}
