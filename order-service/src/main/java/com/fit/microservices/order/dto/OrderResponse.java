package com.fit.microservices.order.dto;

import com.fit.microservices.order.model.OrderLineItem;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;
@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
public class OrderResponse {
    private Long orderId;
    private String orderNumber;
    private List<OrderLineItemsDto> orderLineItems;
    private UserResponse user;
}
