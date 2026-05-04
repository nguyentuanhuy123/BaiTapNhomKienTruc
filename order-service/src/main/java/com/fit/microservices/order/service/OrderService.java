package com.fit.microservices.order.service;

import com.fit.microservices.order.dto.OrderRequest;
import com.fit.microservices.order.dto.OrderResponse;
import com.fit.microservices.order.model.Order;
import com.fit.microservices.order.model.OrderStatus;

public interface OrderService {
    String placeOrder(OrderRequest orderRequest,Long userId);
    OrderResponse getOrderById(Long id);
    void updateOrderStatus(Long orderId, OrderStatus status);
}
