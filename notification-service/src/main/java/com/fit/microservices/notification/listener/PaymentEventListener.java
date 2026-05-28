package com.fit.microservices.notification.listener;

import com.fit.microservices.notification.event.PaymentCompletedEvent;
import com.fit.microservices.notification.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class PaymentEventListener {

    private final EmailService emailService;

    @KafkaListener(
            topics = "payments",
            groupId = "notification-payment-group",
            containerFactory = "paymentCompletedEventListenerFactory"
    )
    public void handlePaymentCompleted(PaymentCompletedEvent event) {
        System.out.println("💳 Payment completed – orderId=" + event.getOrderId()
                + " method=" + event.getPaymentMethod()
                + " email=" + event.getUserEmail());

        if (event.getUserEmail() != null && !event.getUserEmail().isBlank()) {
            emailService.sendPaymentConfirmationEmail(event);
        } else {
            System.out.println("⚠️ Bỏ qua gửi email – không có userEmail trong event");
        }
    }
}
