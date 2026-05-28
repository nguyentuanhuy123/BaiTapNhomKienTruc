package com.fit.microservices.order.service.Impl;

import com.fit.microservices.order.client.InventoryClient;
import com.fit.microservices.order.client.ProductClient;
import com.fit.microservices.order.client.UserClient;
import com.fit.microservices.order.dto.*;
import com.fit.microservices.order.event.OrderCancelEvent;
import com.fit.microservices.order.event.OrderCompletedEvent;
import com.fit.microservices.order.event.OrderPlacedEvent;
import com.fit.microservices.order.exception.ProductOutOfStockException;
import com.fit.microservices.order.model.Order;
import com.fit.microservices.order.model.OrderLineItem;
import com.fit.microservices.order.model.OrderStatus;
import com.fit.microservices.order.producer.OrderEventProducer;
import com.fit.microservices.order.repository.OrderRepository;
import com.fit.microservices.order.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;

import static com.fit.microservices.order.model.OrderStatus.PENDING;

@Service
@RequiredArgsConstructor
@Transactional
public class OrderServiceImpl implements OrderService {
    private final OrderRepository orderRepository;
    private final InventoryClient inventoryClient;
    private final ProductClient productClient;
    private final UserClient userClient;
    private final OrderEventProducer orderEventProducer;

    @Override
    public OrderResponse placeOrder(OrderRequest orderRequest,Long userId) {
        Order order = new Order();
        order.setOrderStatus(OrderStatus.PENDING);
        order.setUserId(userId);
        order.setOrderNumber(UUID.randomUUID().toString());
        order.setPaymentMethod(orderRequest.getPaymentMethod());
        order.setShippingMethod(orderRequest.getShippingMethod());
        order.setShippingFirstName(orderRequest.getShippingFirstName());
        order.setShippingLastName(orderRequest.getShippingLastName());
        order.setShippingStreet(orderRequest.getShippingStreet());

        java.math.BigDecimal subtotal = java.math.BigDecimal.ZERO;

        List<OrderLineItem> orderLineItems = new java.util.ArrayList<>();
        for (OrderLineItemsDto dto : orderRequest.getOrderLineItemsDtoList()) {
            OrderLineItem item = mapToDto(dto);
            
            // Get product info from Product Service
            ProductResponse productInfo;
            try {
                productInfo = productClient.getProductById(dto.getProductId());
            } catch (feign.FeignException.NotFound e) {
                throw new RuntimeException("Product not found with id: " + dto.getProductId());
            } catch (feign.FeignException e) {
                throw new RuntimeException("Error fetching product data for id: " + dto.getProductId() + ". Error: " + e.getMessage());
            }

            if(productInfo == null) {
                throw new RuntimeException("Product not found with id: " + dto.getProductId());
            }
            
            // Set actual price and name
            item.setPrice(productInfo.getPrice() != null ? productInfo.getPrice() : java.math.BigDecimal.ZERO);
            item.setProductName(productInfo.getName() != null ? productInfo.getName() : "Unknown");
            item.setSkuCode(productInfo.getSkuCode() != null ? productInfo.getSkuCode() : dto.getSkuCode());
            item.setOrder(order); // set bidirectional reference
            
            // Calculate subtotal
            java.math.BigDecimal itemTotal = item.getPrice().multiply(java.math.BigDecimal.valueOf(item.getQuantity()));
            subtotal = subtotal.add(itemTotal);
            
            orderLineItems.add(item);
        }
        
        java.math.BigDecimal shippingFee = "priority".equalsIgnoreCase(orderRequest.getShippingMethod()) ? 
                new java.math.BigDecimal("5.00") : new java.math.BigDecimal("2.00");
                
        java.math.BigDecimal tax = subtotal.multiply(new java.math.BigDecimal("0.10")); // Assuming 10% tax
        java.math.BigDecimal totalPrice = subtotal.add(shippingFee).add(tax);

        order.setSubtotal(subtotal);
        order.setShippingFee(shippingFee);
        order.setTax(tax);
        order.setTotalPrice(totalPrice);

        order.setOrderLineItemsList(orderLineItems);
        
        // Cập nhật: Không check stock trực tiếp qua Feign Client vì dùng Event-Driven (Saga)
        // Lưu DB trạng thái PENDING trước
        orderRepository.save(order);
        
        OrderPlacedEvent orderPlacedEvent = new OrderPlacedEvent(
                order.getId(),
                order.getOrderNumber(),
                order.getUserId(),
                order.getOrderLineItemsList().stream()
                        .map(item -> new OrderPlacedEvent.OrderItem(
                                item.getSkuCode(),
                                item.getQuantity(),
                                item.getPrice()
                        )).toList(),
                order.getTotalPrice()
        );

        // Gửi qua producer cho kịch bản A (Order -> Inventory)
        orderEventProducer.publishOrderCreated(orderPlacedEvent);
        
        List<OrderLineItemsDto> itemsDto = order.getOrderLineItemsList().stream()
                .map(item -> new OrderLineItemsDto(
                        item.getProductId(),
                        item.getSkuCode(),
                        item.getColor(),
                        item.getSize(),
                        item.getQuantity()
                )).toList();
                
        OrderResponse response = new OrderResponse(order.getId(), order.getOrderNumber(), itemsDto, null);
        response.setOrderStatus(order.getOrderStatus().name());
        return response;
    }
    private OrderLineItem mapToDto(OrderLineItemsDto orderLineItemDto) {
        OrderLineItem orderLineItem = new OrderLineItem();
        orderLineItem.setProductId(orderLineItemDto.getProductId());
        orderLineItem.setSkuCode(orderLineItemDto.getSkuCode());
        orderLineItem.setColor(orderLineItemDto.getColor());
        orderLineItem.setSize(orderLineItemDto.getSize());
        orderLineItem.setQuantity(orderLineItemDto.getQuantity());
        return orderLineItem;
    }

    @Override
    public OrderResponse getOrderById(Long id) {
        Order order = orderRepository.findById(id).orElse(null);
        if(order == null) return null;
        List<OrderLineItemsDto> items = order.getOrderLineItemsList()
                .stream()
                .map(item->{
                    OrderLineItemsDto itemDto = new OrderLineItemsDto();
                    itemDto.setProductId(item.getProductId());
                    itemDto.setSkuCode(item.getSkuCode());
                    itemDto.setColor(item.getColor());
                    itemDto.setSize(item.getSize());
                    itemDto.setQuantity(item.getQuantity());
                    return itemDto;
                }).toList();
//        UserResponse userResponse = userClient.getUserById(order.getUserId());
        UserResponse userResponse = null;
        OrderResponse response = new OrderResponse(order.getId(), order.getOrderNumber(), items, userResponse);
        response.setOrderStatus(order.getOrderStatus().name());
        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAll().stream()
                .map(order -> {
                    List<OrderLineItemsDto> items = order.getOrderLineItemsList()
                            .stream()
                            .map(item -> {
                                OrderLineItemsDto itemDto = new OrderLineItemsDto();
                                itemDto.setProductId(item.getProductId());
                                itemDto.setSkuCode(item.getSkuCode());
                                itemDto.setColor(item.getColor());
                                itemDto.setSize(item.getSize());
                                itemDto.setQuantity(item.getQuantity());
                                return itemDto;
                            }).toList();
                    UserResponse userResponse = null;
                    OrderResponse response = new OrderResponse(order.getId(), order.getOrderNumber(), items, userResponse);
                    response.setOrderStatus(order.getOrderStatus().name());
                    return response;
                })
                .toList();
    }
    private List<OrderCancelEvent.OrderItem> mapOrderItems(Order order) {
        return order.getOrderLineItemsList().stream()
                .map(item -> new OrderCancelEvent.OrderItem(
                        item.getSkuCode(),
                        item.getQuantity()
                ))
                .toList();
    }

    @Override
    public void updateOrderStatus(Long orderId, OrderStatus status) {
        orderRepository.findById(orderId).ifPresent(order -> {
            OrderStatus previousStatus = order.getOrderStatus();
            if (previousStatus == status) {
                return; // Tránh lặp vô tận (Infinite Loop Prevention)
            }
            order.setOrderStatus(status);
            Order updatedOrder = orderRepository.save(order);
            System.out.println("Đã cập nhật trạng thái đơn hàng: " + status);
            
            if(status == OrderStatus.AWAITING_PAYMENT) {
                com.fit.microservices.order.event.PaymentRequestedEvent paymentRequestedEvent = new com.fit.microservices.order.event.PaymentRequestedEvent(
                        updatedOrder.getId(),
                        updatedOrder.getUserId(),
                        updatedOrder.getTotalPrice(),
                        updatedOrder.getPaymentMethod()
                );
                orderEventProducer.publishPaymentRequested(paymentRequestedEvent);
            }
            if(status == OrderStatus.COMPLETED){
                OrderCompletedEvent orderCompletedEvent = new OrderCompletedEvent(
                        updatedOrder.getId(),
                        updatedOrder.getUserId(),
                        status.name()
                );
                orderEventProducer.publishOrderCompleted(orderCompletedEvent);
            }
            if (status == OrderStatus.CANCELLED) {
                String reason = (previousStatus == OrderStatus.PENDING) ? "INVENTORY_FAILED" : "PAYMENT_FAILED";
                OrderCancelEvent event = new OrderCancelEvent(
                        updatedOrder.getId(),
                        updatedOrder.getUserId(),
                        mapOrderItems(updatedOrder),
                        reason
                );
                orderEventProducer.publishOrderCancelledEvent(event);
            }
        });
    }

    @Override
    @Transactional(readOnly = true)
    public boolean hasPurchasedProduct(Long userId, String skuCode) {
        List<Order> orders = orderRepository.findByUserId(userId);
        if (orders == null) {
            return false;
        }
        for (Order order : orders) {
            if (order.getOrderLineItemsList() != null) {
                for (OrderLineItem item : order.getOrderLineItemsList()) {
                    if (item.getSkuCode() != null && item.getSkuCode().equalsIgnoreCase(skuCode)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
}
