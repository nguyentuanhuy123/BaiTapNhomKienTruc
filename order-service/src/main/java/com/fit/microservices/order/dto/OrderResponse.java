package com.fit.microservices.order.dto;

import com.fit.microservices.order.model.OrderLineItem;
import com.fit.microservices.order.model.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
public class OrderResponse {
    private Long id;
    private String orderNumber;
    private List<OrderLineItemsDto> orderLineItems;
    private UserResponse user;
    private String orderStatus;
    private BigDecimal totalPrice;
    private LocalDateTime createdAt;
    private String paymentMethod;
    private String shippingMethod;
    
    public OrderResponse(Long id, String orderNumber, List<OrderLineItemsDto> orderLineItems, UserResponse user) {
        this.id = id;
        this.orderNumber = orderNumber;
        this.orderLineItems = orderLineItems;
        this.user = user;
    }
}
