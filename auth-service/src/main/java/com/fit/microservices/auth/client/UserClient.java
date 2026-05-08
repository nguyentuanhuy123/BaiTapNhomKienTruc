package com.fit.microservices.auth.client;

import com.fit.microservices.auth.dto.UserRequest;
import com.fit.microservices.auth.dto.UserResponse;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

// ✅ FIX: Thêm fallback method để xử lý khi user-service down
@FeignClient(name = "user-service", path = "/api/user")
public interface UserClient {

    @PostMapping
    @CircuitBreaker(name = "user-service", fallbackMethod = "createUserFallback")
    UserResponse createUser(@RequestBody UserRequest user);

    // Fallback: ném exception rõ ràng thay vì để Feign treo vô hạn
    default UserResponse createUserFallback(@RequestBody UserRequest user, Throwable t) {
        throw new RuntimeException(
                "User service không khả dụng, vui lòng thử lại sau. Chi tiết: " + t.getMessage()
        );
    }
}