package com.fit.microservices.produc.service;

import com.fit.microservices.produc.dto.ProductResponse;

import java.util.List;

public interface WishlistService {
    void toggleWishlist(String username, Long productId);
    List<ProductResponse> getWishlist(String username);
    boolean isInWishlist(String username, Long productId);
}
