package com.fit.microservice.mcp.client;

import com.fit.microservice.mcp.dto.ProductRequest;
import com.fit.microservice.mcp.dto.ProductResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;
@FeignClient(name = "product-service",contextId = "productClient",url = "http://localhost:8080")
public interface ProductClient {
    @GetMapping("/api/product")
    List<ProductResponse> getAllProducts() ;

    @PostMapping("/api/product")
    ProductResponse addProduct(@RequestBody ProductRequest productRequest);
}
