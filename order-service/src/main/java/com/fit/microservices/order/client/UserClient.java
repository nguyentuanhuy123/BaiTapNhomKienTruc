package com.fit.microservices.order.client;

import com.fit.microservices.order.dto.UserResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "user-service")
public interface UserClient {
    @GetMapping("/api/user/{id}")
    UserResponse getUserById(@PathVariable Long id);
}
