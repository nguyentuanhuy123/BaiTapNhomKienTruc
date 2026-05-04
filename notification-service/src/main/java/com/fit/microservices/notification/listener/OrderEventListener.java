package com.fit.microservices.notification.listener;

import com.fit.microservices.notification.event.OrderCancelledEvent;
import com.fit.microservices.notification.event.OrderCompletedEvent;
import com.fit.microservices.notification.event.OrderPlacedEvent;
import com.fit.microservices.notification.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class OrderEventListener {
    private final EmailService emailService;
//    @KafkaListener(
//            topics = "order-topic",
//            groupId = "notification-service-group",
//            containerFactory = "orderPlacedEventListenerFactory"
//    )
//    public void handleOrderEvent(OrderPlacedEvent event) {
//        System.out.println("📨 Nhận được event từ Kafka: " + event);
//        try {
//            emailService.sendOrderEmail(event);
//        } catch (Exception e) {
//            System.err.println("Handle order event failed: " + e.getMessage());
//        }
//    }

    @KafkaListener(
            topics = "orders_completed",
            groupId = "notification-service-group",
            containerFactory = "orderCompletedEventListenerFactory"
    )
    public void handleOrderCompleted(OrderCompletedEvent event) {
        System.out.println("🔔 Gửi thông báo cho user "
                + event.getUserId()
                + " về đơn hàng "
                + event.getOrderId()
                + " trạng thái: "
                + event.getStatus());
        emailService.sendOrderCompletedEvent(event);
    }
    @KafkaListener(
            topics = "orders_cancelled",
            groupId = "notification_cancelled_group",
            containerFactory = "orderCancelledEventListenerFactory"
    )
    public void handleOrderCancelled(OrderCancelledEvent event) {
        System.out.println("[Notification] User"
        + event.getUserId()
                +"đơn hàng"
                +event.getOrderId()
                +"đã bị hủy. Lý do: "
                +event.getReason());
    }

}
