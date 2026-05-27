package com.fit.microservices.order.consumer;

import com.fit.microservices.order.event.InventoryDeductedEvent;
import com.fit.microservices.order.event.InventoryFailedEvent;
import com.fit.microservices.order.event.PaymentCompletedEvent;
import com.fit.microservices.order.event.PaymentFailedEvent;
import com.fit.microservices.order.model.OrderStatus;
import com.fit.microservices.order.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class OrderEventConsumer {
    private final OrderService orderService;

    @KafkaListener(topics = "inventory_deducted", groupId = "order-group")
    public void handleInventoryDeducted(InventoryDeductedEvent event) {
        System.out.println("Nhận InventoryDeductedEvent cho order: " + event.getOrderId());
        orderService.updateOrderStatus(event.getOrderId(), OrderStatus.AWAITING_PAYMENT);
    }

    @KafkaListener(topics = "inventory_failed", groupId = "order-group")
    public void handleInventoryFailed(InventoryFailedEvent inventoryFailedEvent) {
        System.out.println("Nhận InventoryFailedEvent cho order: " + inventoryFailedEvent.getOrderId()
                + ", Lý do: " + inventoryFailedEvent.getMessage()
        );
        orderService.updateOrderStatus(inventoryFailedEvent.getOrderId(),OrderStatus.CANCELLED);
    }

    @KafkaListener(topics = "payment_completed", groupId = "order-group")
    public void handlePaymentCompleted(PaymentCompletedEvent paymentCompletedEvent) {
        System.out.println("Nhận PaymentCompletedEvent cho order: "+paymentCompletedEvent.getOrderId());
        orderService.updateOrderStatus(paymentCompletedEvent.getOrderId(), OrderStatus.COMPLETED);
    }

    @KafkaListener(topics = "payment_failed", groupId = "order-group")
    public void handlePaymentFailed(PaymentFailedEvent paymentFailedEvent) {
        System.out.println("Nhận PaymentFailedEvent cho order: "+paymentFailedEvent.getOrderId());
        orderService.updateOrderStatus(paymentFailedEvent.getOrderId(),OrderStatus.CANCELLED);
    }
}
