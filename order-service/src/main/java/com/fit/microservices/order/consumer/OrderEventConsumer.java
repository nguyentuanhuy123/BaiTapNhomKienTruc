package com.fit.microservices.order.consumer;

import com.fit.microservices.order.event.InventoryDeductedEvent;
import com.fit.microservices.order.event.InventoryFailedEvent;
import com.fit.microservices.order.event.PaymentCompletedEvent;
import com.fit.microservices.order.event.PaymentFailedEvent;
import com.fit.microservices.order.model.OrderStatus;
import com.fit.microservices.order.repository.OrderRepository;
import com.fit.microservices.order.service.CartService;
import com.fit.microservices.order.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class OrderEventConsumer {
    private final OrderService orderService;
    private final OrderRepository orderRepository;
    private final CartService cartService;

    @KafkaListener(topics = "inventory_deducted", groupId = "order-group", containerFactory = "inventoryDeductedKafkaListenerContainerFactory")
    public void handleInventoryDeducted(InventoryDeductedEvent event) {
        System.out.println("Nhận InventoryDeductedEvent cho order: " + event.getOrderId());
        orderService.updateOrderStatus(event.getOrderId(), OrderStatus.AWAITING_PAYMENT);
    }

    @KafkaListener(topics = "inventory_failed", groupId = "order-group", containerFactory = "inventoryFailedKafkaListenerContainerFactory")
    public void handleInventoryFailed(InventoryFailedEvent inventoryFailedEvent) {
        System.out.println("Nhận InventoryFailedEvent cho order: " + inventoryFailedEvent.getOrderId()
                + ", Lý do: " + inventoryFailedEvent.getMessage()
        );
        orderService.updateOrderStatus(inventoryFailedEvent.getOrderId(),OrderStatus.CANCELLED);
    }

    @KafkaListener(topics = "payment_completed", groupId = "order-group", containerFactory = "paymentCompletedKafkaListenerContainerFactory")
    public void handlePaymentCompleted(PaymentCompletedEvent paymentCompletedEvent) {
        System.out.println("Nhận PaymentCompletedEvent cho order: "+paymentCompletedEvent.getOrderId());
        orderService.updateOrderStatus(paymentCompletedEvent.getOrderId(), OrderStatus.COMPLETED);
        
        orderRepository.findById(paymentCompletedEvent.getOrderId()).ifPresent(order -> {
            Long userId = order.getUserId();
            if (userId != null) {
                cartService.clearCart(userId);
                System.out.println("Đã xóa giỏ hàng cho user: " + userId + " sau khi thanh toán order: " + order.getId());
            }
        });
    }

    @KafkaListener(topics = "payment_failed", groupId = "order-group", containerFactory = "paymentFailedKafkaListenerContainerFactory")
    public void handlePaymentFailed(PaymentFailedEvent paymentFailedEvent) {
        System.out.println("Nhận PaymentFailedEvent cho order: "+paymentFailedEvent.getOrderId());
        orderService.updateOrderStatus(paymentFailedEvent.getOrderId(),OrderStatus.CANCELLED);
    }
}
