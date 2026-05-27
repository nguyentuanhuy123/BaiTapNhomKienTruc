package com.fit.microservices.order.client;

import com.fit.microservices.order.dto.ProductResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "product-service")
public interface ProductClient {
    @GetMapping("/api/product/{id}")
    ProductResponse getProductById(@PathVariable("id") Long id);
}
