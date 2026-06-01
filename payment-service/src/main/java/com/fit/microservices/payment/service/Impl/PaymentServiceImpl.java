package com.fit.microservices.payment.service.Impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fit.microservices.payment.dto.PaymentRequest;
import com.fit.microservices.payment.dto.PaymentResponse;
import com.fit.microservices.payment.event.InventoryReservedEvent;
import com.fit.microservices.payment.model.Payment;
import com.fit.microservices.payment.model.PaymentMethod;
import com.fit.microservices.payment.model.PaymentStatus;
import com.fit.microservices.payment.repository.PaymentRepository;
import com.fit.microservices.payment.service.PaymentService;
import com.fit.microservices.payment.strategy.PaymentStrategy;
import com.fit.microservices.payment.strategy.PaymentStrategyRegistry;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final PaymentStrategyRegistry strategyRegistry; // ← thay thế if/else cũ
    private final ObjectMapper objectMapper;

    private static final AtomicLong orderIdGen = new AtomicLong(10000);

    // ── Kafka flow (inventory reserved) ────────────────────────────────
    @Override
    @Transactional
    public PaymentResponse processPayment(InventoryReservedEvent event) {
        if (!"RESERVED".equalsIgnoreCase(event.getStatus())) {
            return null;
        }

        Payment payment = paymentRepository
                .findFirstByOrderIdOrderByIdDesc(event.getOrderId())
                .orElseGet(() -> {
                    Payment p = new Payment();
                    p.setOrderId(event.getOrderId());
                    p.setAmount(BigDecimal.valueOf(100));
                    p.setMethod(PaymentMethod.VNPAY);
                    p.setStatus(PaymentStatus.PENDING);
                    p.setTransactionId(UUID.randomUUID().toString());
                    return paymentRepository.save(p);
                });

        if (payment.getStatus() != PaymentStatus.PENDING) {
            return new PaymentResponse(payment.getOrderId(), payment.getStatus().name(),
                    payment.getPaymentUrl(), "Already processed");
        }

        if (payment.getPaymentUrl() == null) {
            // Delegate sang VNPay strategy để tạo URL
            PaymentStrategy strategy = strategyRegistry.getStrategy(payment.getMethod());
            PaymentRequest mockRequest = new PaymentRequest();
            mockRequest.setPaymentMethod(payment.getMethod().name());
            strategy.initiate(payment, mockRequest);
        }

        return new PaymentResponse(payment.getOrderId(), payment.getStatus().name(),
                payment.getPaymentUrl(), null);
    }

    // ── REST flow từ Checkout FE ────────────────────────────────────────
    @Override
    @Transactional
    public PaymentResponse initiatePayment(PaymentRequest request) {
        // Tạo Payment entity cơ bản (chưa set method/status — strategy sẽ set)
        Payment payment = buildBasePayment(request);

        // Delegate hoàn toàn cho strategy — không còn if/else ở đây
        PaymentStrategy strategy = strategyRegistry.getStrategy(request.getPaymentMethod());
        return strategy.initiate(payment, request);
    }

    // ── Helper ───────────────────────────────────────────────────────────
    private Payment buildBasePayment(PaymentRequest request) {
        Payment payment = new Payment();
        // Ưu tiên dùng orderId từ order-service (REST flow từ checkout);
        // fallback sang auto-gen chỉ dành cho Kafka flow (InventoryReservedEvent).
        payment.setOrderId(request.getOrderId() != null
                ? request.getOrderId()
                : orderIdGen.incrementAndGet());
        payment.setAmount(request.getAmount() != null ? request.getAmount() : BigDecimal.ZERO);
        payment.setTransactionId(UUID.randomUUID().toString());
        payment.setUserEmail(request.getUserEmail());
        payment.setUserName(request.getUserName());
        payment.setShippingAddress(request.getShippingAddress());

        if (request.getItems() != null) {
            try {
                payment.setItemsJson(objectMapper.writeValueAsString(request.getItems()));
            } catch (JsonProcessingException e) {
                payment.setItemsJson("[]");
            }
        }
        return payment;
    }
}