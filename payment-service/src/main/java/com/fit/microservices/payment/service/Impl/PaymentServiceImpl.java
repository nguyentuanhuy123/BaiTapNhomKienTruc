package com.fit.microservices.payment.service.Impl;

import com.fit.microservices.payment.dto.PaymentResponse;
import com.fit.microservices.payment.event.InventoryReservedEvent;
import com.fit.microservices.payment.event.PaymentCompletedEvent;
import com.fit.microservices.payment.event.PaymentFailedEvent;
import com.fit.microservices.payment.model.Payment;
import com.fit.microservices.payment.model.PaymentMethod;
import com.fit.microservices.payment.model.PaymentStatus;
import com.fit.microservices.payment.producer.KafkaProducerService;
import com.fit.microservices.payment.repository.PaymentRepository;
import com.fit.microservices.payment.service.PaymentService;
import com.fit.microservices.payment.service.gateway.PaymentGateway;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final PaymentGateway paymentGateway;

    @Override
    @Transactional
    public PaymentResponse processPayment(InventoryReservedEvent event) {

        // ❌ Inventory không reserve được → không thanh toán
        if (!"RESERVED".equalsIgnoreCase(event.getStatus())) {
            return null;
        }

        // ✅ 1 order chỉ có 1 payment
        Payment payment = paymentRepository
                .findByOrderId(event.getOrderId())
                .orElseGet(() -> {
                    Payment p = new Payment();
                    p.setOrderId(event.getOrderId());
                    p.setAmount(BigDecimal.valueOf(100)); // mock
                    p.setMethod(PaymentMethod.VNPAY);
                    p.setStatus(PaymentStatus.PENDING);
                    p.setTransactionId(UUID.randomUUID().toString());
                    return paymentRepository.save(p);
                });

        // ❌ Đã xử lý rồi thì không tạo lại
        if (payment.getStatus() != PaymentStatus.PENDING) {
            return new PaymentResponse(
                    payment.getOrderId(),
                    payment.getPaymentUrl()
            );
        }

        // ✅ Chưa có URL thì tạo
        if (payment.getPaymentUrl() == null) {
            String paymentUrl = paymentGateway.createPaymentUrl(payment);
            payment.setPaymentUrl(paymentUrl);
            paymentRepository.save(payment);
        }

        return new PaymentResponse(
                payment.getOrderId(),
                payment.getPaymentUrl()
        );
    }
}





