package com.fit.microservices.produc.service.Impl;

import com.fit.microservices.produc.dto.ProductResponse;
import com.fit.microservices.produc.model.Product;
import com.fit.microservices.produc.model.WishlistItem;
import com.fit.microservices.produc.repository.ProductRepository;
import com.fit.microservices.produc.repository.WishlistRepository;
import com.fit.microservices.produc.service.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WishlistServiceImpl implements WishlistService {

    private final WishlistRepository wishlistRepository;
    private final ProductRepository productRepository;
    private final ProductServiceImpl productService; // Injecting implementation for mapping

    @Override
    @Transactional
    public void toggleWishlist(String username, Long productId) {
        Optional<WishlistItem> existing = wishlistRepository.findByUsernameAndProductId(username, productId);
        if (existing.isPresent()) {
            wishlistRepository.delete(existing.get());
        } else {
            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new RuntimeException("Product not found"));
            WishlistItem item = WishlistItem.builder()
                    .username(username)
                    .product(product)
                    .build();
            wishlistRepository.save(item);
        }
    }

    @Override
    public List<ProductResponse> getWishlist(String username) {
        return wishlistRepository.findByUsername(username)
                .stream()
                .map(item -> productService.mapToProductResponse(item.getProduct()))
                .collect(Collectors.toList());
    }

    @Override
    public boolean isInWishlist(String username, Long productId) {
        return wishlistRepository.findByUsernameAndProductId(username, productId).isPresent();
    }
}
