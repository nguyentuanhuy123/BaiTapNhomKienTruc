package com.fit.microservices.produc.controller;

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
    public List<ProductResponse> findAllProducts() {
        return productService.findAll();
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
