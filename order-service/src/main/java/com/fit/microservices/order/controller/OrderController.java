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
import java.util.List;
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
    public OrderResponse orderPlace(@RequestBody OrderRequest orderRequest) {
        Long userId = (Long) SecurityContextHolder.getContext()
                .getAuthentication()
                .getPrincipal();
        return orderService.placeOrder(orderRequest,userId);
    }

    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @Operation(summary = "Get order by ID")
    @GetMapping("/{orderId}")
    public ResponseEntity<OrderResponse> getOrderById(@PathVariable Long orderId) {
        return new ResponseEntity<>(orderService.getOrderById(orderId), HttpStatus.OK);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all orders")
    @GetMapping
    public ResponseEntity<List<OrderResponse>> getAllOrders() {
        return new ResponseEntity<>(orderService.getAllOrders(), HttpStatus.OK);
    }

    @PreAuthorize("hasRole('USER')")
    @Operation(summary = "Get my orders")
    @GetMapping("/my-orders")
    public ResponseEntity<List<OrderResponse>> getMyOrders() {
        Long userId = (Long) SecurityContextHolder.getContext()
                .getAuthentication()
                .getPrincipal();
        return new ResponseEntity<>(orderService.getMyOrders(userId), HttpStatus.OK);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update order status")
    @PutMapping("/{orderId}/status")
    public ResponseEntity<String> updateOrderStatus(@PathVariable Long orderId, @RequestBody java.util.Map<String, String> request) {
        String statusStr = request.get("status");
        if (statusStr == null) {
            return new ResponseEntity<>("Status is required", HttpStatus.BAD_REQUEST);
        }
        try {
            com.fit.microservices.order.model.OrderStatus status = com.fit.microservices.order.model.OrderStatus.valueOf(statusStr.toUpperCase());
            orderService.updateOrderStatus(orderId, status);
            return new ResponseEntity<>("Order status updated successfully", HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>("Invalid status value", HttpStatus.BAD_REQUEST);
        }
    }

    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @Operation(summary = "Update order payment method")
    @PutMapping("/{orderId}/payment-method")
    public ResponseEntity<String> updatePaymentMethod(@PathVariable Long orderId, @RequestBody java.util.Map<String, String> request) {
        String paymentMethod = request.get("paymentMethod");
        if (paymentMethod == null) {
            return new ResponseEntity<>("Payment method is required", HttpStatus.BAD_REQUEST);
        }
        orderService.updatePaymentMethod(orderId, paymentMethod);
        return new ResponseEntity<>("Order payment method updated successfully", HttpStatus.OK);
    }

    @PreAuthorize("hasRole('USER')")
    @Operation(summary = "Check if user has purchased product")
    @GetMapping("/has-purchased")
    public ResponseEntity<Boolean> hasPurchasedProduct(@RequestParam("skuCode") String skuCode) {
        Long userId = (Long) SecurityContextHolder.getContext()
                .getAuthentication()
                .getPrincipal();
        boolean purchased = orderService.hasPurchasedProduct(userId, skuCode);
        return new ResponseEntity<>(purchased, HttpStatus.OK);
    }

    public CompletableFuture<String> fallbackMethod(OrderRequest orderRequest, RuntimeException runtimeException) {
        log.info("Cannot Place Order Executing Fallback logic");
        return CompletableFuture.supplyAsync(() -> "Oops! Something went wrong, please order after some time!");
    }
}
