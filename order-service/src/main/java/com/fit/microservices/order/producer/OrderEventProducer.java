package com.fit.microservices.order.producer;

import com.fit.microservices.order.event.OrderCancelEvent;
import com.fit.microservices.order.event.OrderCompletedEvent;
import com.fit.microservices.order.event.OrderPlacedEvent;
import com.fit.microservices.order.event.PaymentRequestedEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class OrderEventProducer {
    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void publishOrderCreated(OrderPlacedEvent event) {
        System.out.println("Gửi OrderPlacedEvent: " + event.getOrderId());
        kafkaTemplate.send("order_created", event);
    }
    
    public void publishOrderCompleted(OrderCompletedEvent event) {
        System.out.println("Gửi OrderCompletedEvent: " + event.getOrderId());
        kafkaTemplate.send("order_completed", event);
    }
    
    public void publishOrderCancelledEvent(OrderCancelEvent event) {
        System.out.println("Gửi OrderCancelledEvent: " + event.getOrderId());
        kafkaTemplate.send("order_cancelled", event);
    }

    public void publishPaymentRequested(PaymentRequestedEvent event) {
        System.out.println("Gửi PaymentRequestedEvent cho order: " + event.getOrderId());
        kafkaTemplate.send("payment_requested", event);
    }
}
