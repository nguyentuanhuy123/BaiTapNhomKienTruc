package com.fit.microservices.order.controller;

import com.fit.microservices.order.dto.AddCartItemRequest;
import com.fit.microservices.order.dto.CartResponse;
import com.fit.microservices.order.dto.UpdateCartItemQuantityRequest;
import com.fit.microservices.order.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
//@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class CartController {
    private final CartService cartService;

    /**
     * Temporary userId resolver.
     * - When JWT is enabled: principal is userId (Long) set by JwtAuthFilter.
     * - When JWT is disabled (permitAll): returns 0L so FE can still test flows.
     *
     * TODO: replace with real identity (JWT / gateway header) before production.
     */
    private Long currentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getPrincipal() == null) {
            return null;
        }
        Object principal = auth.getPrincipal();
        if (principal instanceof Long l) {
            return l;
        }
        if (principal instanceof Integer i) {
            return i.longValue();
        }
        if (principal instanceof String s) {
            try {
                return Long.parseLong(s);
            } catch (NumberFormatException ignored) {
            }
        }
        return null;
    }

    /**
     * Resolve userId for requests.
     * Priority:
     * 1) Authenticated principal (when JWT is enabled)
     *
     * NOTE: This requires a valid JWT in the Authorization header.
     */
    private Long resolveUserId() {
        Long fromAuth = currentUserId();
        if (fromAuth == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing or invalid JWT");
        }
        return fromAuth;
    }

    // =========================
    // New RESTful API
    // =========================

    @GetMapping
    public ResponseEntity<CartResponse> getCart() {
        return ResponseEntity.ok(cartService.getCart(resolveUserId()));
    }

    @PostMapping("/items")
    public ResponseEntity<CartResponse> addItem(@RequestBody AddCartItemRequest request) {
        Long userId = resolveUserId();
        return ResponseEntity.ok(cartService.addItem(userId, request));
    }

    @PatchMapping("/items/{itemId}")
    public ResponseEntity<CartResponse> updateItemQuantity(
            @PathVariable Long itemId,
            @RequestBody UpdateCartItemQuantityRequest request
    ) {
        return ResponseEntity.ok(cartService.updateItemQuantity(resolveUserId(), itemId, request.getQuantity()));
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<CartResponse> removeItem(@PathVariable Long itemId) {
        return ResponseEntity.ok(cartService.removeItem(resolveUserId(), itemId));
    }

    @DeleteMapping
    public ResponseEntity<CartResponse> clearCart() {
        return ResponseEntity.ok(cartService.clearCart(resolveUserId()));
    }

}
