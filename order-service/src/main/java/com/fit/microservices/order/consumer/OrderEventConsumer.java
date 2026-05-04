package com.fit.microservices.order.consumer;

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
    @KafkaListener(
        topics = "payments",
        containerFactory = "paymentCompletedKafkaListenerContainerFactory"
    )
    public void handlePaymentCompleted(PaymentCompletedEvent paymentCompletedEvent) {
        System.out.println("Nhận PaymentCompletedEvent: "+paymentCompletedEvent);
        orderService.updateOrderStatus(paymentCompletedEvent.getOrderId(), OrderStatus.COMPLETED);
    }
    @KafkaListener(
            topics = "payments_failed",
            containerFactory = "paymentFailedKafkaListenerContainerFactory"
    )
    public void handlePaymentFailed(PaymentFailedEvent paymentFailedEvent) {
        System.out.println("Nhận PaymentFailedEvent: "+paymentFailedEvent);
        orderService.updateOrderStatus(paymentFailedEvent.getOrderId(),OrderStatus.CANCELLED);
    }

    public void handleInventoryFailed(InventoryFailedEvent inventoryFailedEvent) {
        System.out.println("Nhận InventoryFailedEvent: "
                +"OrderId: "+inventoryFailedEvent.getOrderId()
                +", Status: "+inventoryFailedEvent.getStatus()
                +", Reason: "+inventoryFailedEvent.getMessage()
        );
        orderService.updateOrderStatus(inventoryFailedEvent.getOrderId(),OrderStatus.CANCELLED);
        System.out.println("Đơn hàng "+ inventoryFailedEvent.getOrderId() + " đã bị hủy do: " + inventoryFailedEvent.getMessage());
    }
}
