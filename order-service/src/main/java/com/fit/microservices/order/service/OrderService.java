package com.fit.microservices.order.service;

import com.fit.microservices.order.dto.OrderRequest;
import com.fit.microservices.order.dto.OrderResponse;
import com.fit.microservices.order.model.Order;
import com.fit.microservices.order.model.OrderStatus;

import java.util.List;

public interface OrderService {
    OrderResponse placeOrder(OrderRequest orderRequest, Long userId);
    OrderResponse getOrderById(Long id);
    OrderResponse getOrderByOrderNumber(String orderNumber);
    void updateOrderStatus(Long orderId, OrderStatus status);
    void updateOrderStatus(Long orderId, OrderStatus status, String paymentMethod);
    void updatePaymentMethod(Long orderId, String paymentMethod);
    List<OrderResponse> getAllOrders();
    List<OrderResponse> getMyOrders(Long userId);
    boolean hasPurchasedProduct(Long userId, String skuCode);
}
