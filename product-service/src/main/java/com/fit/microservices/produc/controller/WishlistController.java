package com.fit.microservices.produc.controller;

import com.fit.microservices.produc.dto.ProductResponse;
import com.fit.microservices.produc.service.WishlistService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Wishlist API", description = "Operations related to user wishlist")
@RestController
@RequestMapping("/api/wishlist")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistService wishlistService;

    @Operation(summary = "Toggle product in wishlist")
    @PostMapping("/{productId}")
    @ResponseStatus(HttpStatus.OK)
    public void toggleWishlist(@RequestParam String username, @PathVariable Long productId) {
        wishlistService.toggleWishlist(username, productId);
    }

    @Operation(summary = "Get user wishlist")
    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    public List<ProductResponse> getWishlist(@RequestParam String username) {
        return wishlistService.getWishlist(username);
    }

    @Operation(summary = "Check if product is in wishlist")
    @GetMapping("/check/{productId}")
    @ResponseStatus(HttpStatus.OK)
    public boolean isInWishlist(@RequestParam String username, @PathVariable Long productId) {
        return wishlistService.isInWishlist(username, productId);
    }
}
