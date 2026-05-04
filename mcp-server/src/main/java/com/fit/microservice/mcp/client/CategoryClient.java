package com.fit.microservice.mcp.client;


import com.fit.microservice.mcp.dto.CategoryResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;

@FeignClient(name = "product-service",contextId = "categoryClient",url = "http://localhost:8080")
public interface CategoryClient {
    @GetMapping("/api/category")
    List<CategoryResponse> findAll();
}
