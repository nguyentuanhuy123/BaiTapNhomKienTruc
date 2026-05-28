package com.fit.microservices.order.producer;

import com.fit.microservices.order.event.OrderCancelEvent;
import com.fit.microservices.order.event.OrderCompletedEvent;
import com.fit.microservices.order.event.OrderPlacedEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class OrderEventProducer {
    private final KafkaTemplate<String, Object> kafkaTemplate;

    private static final String TOPIC_ORDER_CREATED = "orders";
    private static final String TOPIC_ORDER_COMPLETED = "orders_completed";
    private static final String TOPIC_ORDER_CANCELLED = "orders_cancelled";
    public void publishOrderCreated(OrderPlacedEvent event) {
        System.out.println("Gửi OrderPlacedEvent: " + event);
        kafkaTemplate.send(TOPIC_ORDER_CREATED, event);
    }
    public void publishOrderCompleted(OrderCompletedEvent event) {
        System.out.println("Gửi OrderCompletedEvent: " + event);
        kafkaTemplate.send(TOPIC_ORDER_COMPLETED, event);
    }
    public void publishOrderCancelledEvent(OrderCancelEvent  event) {
        System.out.println("Gửi OrderCancelledEvent: " + event);
        kafkaTemplate.send(TOPIC_ORDER_CANCELLED, event);
    }

}
