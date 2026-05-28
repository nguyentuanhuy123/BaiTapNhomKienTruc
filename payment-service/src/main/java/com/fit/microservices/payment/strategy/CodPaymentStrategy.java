package com.fit.microservices.payment.strategy;

import com.fit.microservices.payment.dto.PaymentRequest;
import com.fit.microservices.payment.dto.PaymentResponse;
import com.fit.microservices.payment.event.PaymentCompletedEvent;
import com.fit.microservices.payment.model.Payment;
import com.fit.microservices.payment.model.PaymentMethod;
import com.fit.microservices.payment.model.PaymentStatus;
import com.fit.microservices.payment.producer.KafkaProducerService;
import com.fit.microservices.payment.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Strategy cho COD (Cash on Delivery):
 * - Xác nhận đơn hàng thành công ngay lập tức
 * - Gửi event Kafka để notification service gửi email
 * - Không có payment URL, không có callback
 */
@Component
@RequiredArgsConstructor
public class CodPaymentStrategy implements PaymentStrategy {

    private final PaymentRepository paymentRepository;
    private final KafkaProducerService kafkaProducerService;

    @Override
    public PaymentMethod supportedMethod() {
        return PaymentMethod.COD;
    }

    @Override
    public PaymentResponse initiate(Payment payment, PaymentRequest request) {
        payment.setMethod(PaymentMethod.COD);
        payment.setStatus(PaymentStatus.SUCCESS);
        paymentRepository.save(payment);

        kafkaProducerService.sendPaymentCompleted(buildCompletedEvent(payment, request));

        return new PaymentResponse(payment.getOrderId(), "SUCCESS", null, "Đặt hàng thành công!");
    }

    // ── Helper ───────────────────────────────────────────────────────────
    private PaymentCompletedEvent buildCompletedEvent(Payment payment, PaymentRequest request) {
        List<PaymentCompletedEvent.OrderItem> items = null;

        if (request.getItems() != null) {
            items = request.getItems().stream()
                    .map(i -> new PaymentCompletedEvent.OrderItem(
                            i.getName(),
                            i.getQuantity(),
                            i.getPrice() != null ? i.getPrice().doubleValue() : 0.0,
                            i.getSize(),
                            i.getColor()
                    ))
                    .collect(Collectors.toList());
        }

        return new PaymentCompletedEvent(
                payment.getOrderId(),
                payment.getTransactionId(),
                payment.getAmount().doubleValue(),
                payment.getMethod().name(),
                payment.getUserEmail(),
                payment.getUserName(),
                payment.getShippingAddress(),
                items
        );
    }
}
