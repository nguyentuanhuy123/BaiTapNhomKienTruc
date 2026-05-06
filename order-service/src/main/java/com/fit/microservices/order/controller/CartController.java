package com.fit.microservices.order.controller;

import com.fit.microservices.order.dto.AddCartItemRequest;
import com.fit.microservices.order.dto.CartResponse;
import com.fit.microservices.order.dto.UpdateCartItemQuantityRequest;
import com.fit.microservices.order.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
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
            return 0L;
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
        return 0L;
    }

    /**
     * Resolve userId for requests.
     * Priority:
     * 1) Authenticated principal (when JWT is enabled)
     * 2) userId provided by frontend in request body (when security is permitAll)
     *
     * NOTE: This is for development/testing only. In production, do NOT trust userId from client.
     */
    private Long resolveUserId(Long requestUserId) {
        Long fromAuth = currentUserId();
        if (fromAuth != null && fromAuth != 0L) {
            return fromAuth;
        }
        return requestUserId != null ? requestUserId : 0L;
    }

    // =========================
    // New RESTful API
    // =========================

    @GetMapping
    public ResponseEntity<CartResponse> getCart(@RequestParam(required = false) Long userId) {
        return ResponseEntity.ok(cartService.getCart(resolveUserId(userId)));
    }

    @PostMapping("/items")
    public ResponseEntity<CartResponse> addItem(@RequestBody AddCartItemRequest request) {
        Long userId = resolveUserId(request.getUserId());
        return ResponseEntity.ok(cartService.addItem(userId, request));
    }

    @PatchMapping("/items/{itemId}")
    public ResponseEntity<CartResponse> updateItemQuantity(
            @PathVariable Long itemId,
            @RequestBody UpdateCartItemQuantityRequest request,
            @RequestParam(required = false) Long userId
    ) {
        return ResponseEntity.ok(cartService.updateItemQuantity(resolveUserId(userId), itemId, request.getQuantity()));
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<CartResponse> removeItem(@PathVariable Long itemId,
                                                   @RequestParam(required = false) Long userId) {
        return ResponseEntity.ok(cartService.removeItem(resolveUserId(userId), itemId));
    }

    @DeleteMapping
    public ResponseEntity<CartResponse> clearCart(@RequestParam(required = false) Long userId) {
        return ResponseEntity.ok(cartService.clearCart(resolveUserId(userId)));
    }

    // =========================
    // Legacy endpoints (deprecated)
    // =========================

    /** @deprecated use POST /api/cart/items */
    @Deprecated
    @PreAuthorize("hasRole('USER')")
    @PostMapping("/add")
    public ResponseEntity<CartResponse> addToCart(@RequestBody AddCartItemRequest request) {
        Long userId = resolveUserId(request.getUserId());
        return ResponseEntity.ok(cartService.addItem(userId, request));
    }

    /** @deprecated use DELETE /api/cart/items/{itemId} */
    @Deprecated
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<CartResponse> deleteFromCart(@PathVariable Long id,
                                                       @RequestParam(required = false) Long userId) {
        return ResponseEntity.ok(cartService.removeItem(resolveUserId(userId), id));
    }

    /** @deprecated use DELETE /api/cart */
    @Deprecated
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    @DeleteMapping("/delete")
    public ResponseEntity<CartResponse> deleteFromCart(@RequestParam(required = false) Long userId) {
        return ResponseEntity.ok(cartService.clearCart(resolveUserId(userId)));
    }
}
