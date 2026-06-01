package com.fit.microservices.order.consumer;

import com.fit.microservices.order.client.ProductClient;
import com.fit.microservices.order.dto.ProductResponse;
import com.fit.microservices.order.event.FlashSaleOrderSuccessEvent;
import com.fit.microservices.order.model.Order;
import com.fit.microservices.order.model.OrderLineItem;
import com.fit.microservices.order.model.OrderStatus;
import com.fit.microservices.order.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Collections;

@Service
@RequiredArgsConstructor
public class FlashSaleOrderConsumer {

    private final OrderRepository orderRepository;
    private final ProductClient productClient;

    @KafkaListener(
            topics = "flash-sale-orders",
            groupId = "order-group",
            containerFactory = "flashSaleOrderSuccessKafkaListenerContainerFactory"
    )
    @Transactional
    public void handleFlashSaleOrderSuccess(FlashSaleOrderSuccessEvent event) {
        System.out.println("⚡ [KAFKA-CONSUMER] Received Flash Sale Success Event for Order ID: " + event.getOrderId());
        
        try {
            Long prodId = null;
            try {
                prodId = Long.parseLong(event.getProductId());
            } catch (NumberFormatException e) {
                // It is a SKU String (e.g. "SL-X")
                System.out.println("🔍 ProductId is SKU String. Querying product-service to resolve Database ID for: " + event.getProductId());
                java.util.Map<String, Object> productsPage = productClient.getAllProducts(0, 100);
                if (productsPage != null && productsPage.containsKey("content")) {
                    java.util.List<java.util.Map<String, Object>> content = (java.util.List<java.util.Map<String, Object>>) productsPage.get("content");
                    if (content != null) {
                        for (java.util.Map<String, Object> prodMap : content) {
                            if (event.getProductId().equalsIgnoreCase((String) prodMap.get("skuCode"))) {
                                prodId = Long.valueOf(String.valueOf(prodMap.get("id")));
                                System.out.println("✅ Found matching product ID: " + prodId + " for SKU: " + event.getProductId());
                                break;
                            }
                        }
                    }
                }
            }

            if (prodId == null) {
                throw new RuntimeException("Could not resolve database product ID for SKU: " + event.getProductId());
            }

            ProductResponse productInfo = productClient.getProductById(prodId);
            
            Order order = new Order();
            // Since Hazelcast has guaranteed stock availability, directly set to AWAITING_PAYMENT
            order.setOrderStatus(OrderStatus.AWAITING_PAYMENT);
            order.setUserId(Long.parseLong(event.getUserId()));
            // Match orderNumber with the event's UUID orderId for seamless polling!
            order.setOrderNumber(event.getOrderId());
            order.setPaymentMethod("COD"); // Default placeholder
            order.setShippingMethod("standard");
            order.setShippingFirstName("Flash");
            order.setShippingLastName("Sale");
            order.setShippingStreet("Space-Based RAM Street, Hazelcast Ward, Kafka District, E-Commerce City");

            OrderLineItem item = new OrderLineItem();
            item.setProductId(prodId);
            item.setSkuCode(productInfo != null ? productInfo.getSkuCode() : event.getProductId());
            item.setProductName(productInfo != null ? productInfo.getName() : "Flash Sale Product");
            item.setPrice(event.getPrice());
            item.setQuantity(event.getQuantity());
            item.setColor("Default");
            item.setSize("41");
            item.setOrder(order);

            order.setOrderLineItemsList(Collections.singletonList(item));

            BigDecimal subtotal = event.getPrice().multiply(BigDecimal.valueOf(event.getQuantity()));
            BigDecimal shippingFee = new BigDecimal("2.00");
            BigDecimal tax = subtotal.multiply(new BigDecimal("0.10"));
            BigDecimal totalPrice = subtotal.add(shippingFee).add(tax);

            order.setSubtotal(subtotal);
            order.setShippingFee(shippingFee);
            order.setTax(tax);
            order.setTotalPrice(totalPrice);

            orderRepository.save(order);
            System.out.println("✨ [DATABASE] Successfully saved Flash Sale Order " + event.getOrderId() + " to Database MySQL.");
        } catch (Exception e) {
            System.err.println("❌ Error processing Flash Sale Order Event: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
