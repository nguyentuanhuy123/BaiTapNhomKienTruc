package com.fit.microservices.order.controller;

import com.fit.microservices.order.dto.OrderRequest;
import com.fit.microservices.order.dto.OrderResponse;
import com.fit.microservices.order.model.Order;
import com.fit.microservices.order.service.OrderService;
import com.sun.security.auth.UserPrincipal;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import io.github.resilience4j.timelimiter.annotation.TimeLimiter;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.concurrent.CompletableFuture;
@Tag(name = "Order API", description = "Operations related to orders")
@RestController
@RequestMapping("/api/order")
@RequiredArgsConstructor
@Slf4j
public class OrderController {
    private final OrderService orderService;

//    @CircuitBreaker(name = "inventory",fallbackMethod = "fallbackMethod")
//    @TimeLimiter(name = "inventory")
//    @Retry(name="inventory")
    @PreAuthorize("hasRole('USER')")
    @Operation(summary = "Place new order")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public String orderPlace(@RequestBody OrderRequest orderRequest) {
        Long userId = (Long) SecurityContextHolder.getContext()
                .getAuthentication()
                .getPrincipal();
        return orderService.placeOrder(orderRequest,userId);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get order by ID")
    @GetMapping("/{orderId}")
    public ResponseEntity<OrderResponse> getOrderById(@PathVariable Long orderId) {
        return new ResponseEntity<>(orderService.getOrderById(orderId), HttpStatus.OK);
    }
    public CompletableFuture<String> fallbackMethod(OrderRequest orderRequest, RuntimeException runtimeException) {
        log.info("Cannot Place Order Executing Fallback logic");
        return CompletableFuture.supplyAsync(() -> "Oops! Something went wrong, please order after some time!");
    }
}
