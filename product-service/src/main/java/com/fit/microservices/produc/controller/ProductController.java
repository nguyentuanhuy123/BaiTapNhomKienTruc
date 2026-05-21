package com.fit.microservices.produc.controller;

import com.fit.microservices.produc.dto.PaginatedResponse;
import com.fit.microservices.produc.dto.ProductRequest;
import com.fit.microservices.produc.dto.ProductResponse;
import com.fit.microservices.produc.dto.UserPrincipal;
import com.fit.microservices.produc.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@Tag(name = "Product API", description = "Operations related to products")
@RestController
@RequestMapping("/api/product")
@RequiredArgsConstructor
public class ProductController {
    private  final ProductService productService;

    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create new product")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProductResponse createProduct(@Valid @RequestBody ProductRequest productRequest) {
        return productService.save(productRequest);
    }

    @Operation(summary = "Get all product")
    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    public PaginatedResponse<ProductResponse> findAllProducts(
            @RequestParam(value = "page", defaultValue = "0", required = false) int page,
            @RequestParam(value = "size", defaultValue = "10", required = false) int size,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "brand", required = false) String brand,
            @RequestParam(value = "color", required = false) String color
    ) {
        return productService.findAll(page, size, category, brand, color);
    }

    @Operation(summary = "Get product by ID")
    @GetMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public ProductResponse findProductById(@PathVariable Long id) {
        return productService.getProductResponseById(id);
    }

    @Operation(summary = "Get flash sale products")
    @GetMapping("/flash-sale")
    @ResponseStatus(HttpStatus.OK)
    public PaginatedResponse<ProductResponse> findFlashSaleProducts(
            @RequestParam(value = "page", defaultValue = "0", required = false) int page,
            @RequestParam(value = "size", defaultValue = "6", required = false) int size
    ) {
        return productService.findFlashSaleProducts(page, size);
    }
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update product")
    @PutMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public ProductResponse updateProduct(@PathVariable Long id,@Valid @RequestBody ProductRequest productRequest) {
        return productService.update(id, productRequest);
    }
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete product by ID")
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public void deleteProduct(@PathVariable Long id) {
        productService.deleteById(id);
    }

}
