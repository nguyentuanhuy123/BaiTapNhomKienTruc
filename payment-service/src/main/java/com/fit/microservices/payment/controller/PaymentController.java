package com.fit.microservices.payment.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fit.microservices.payment.event.PaymentCompletedEvent;
import com.fit.microservices.payment.event.PaymentFailedEvent;
import com.fit.microservices.payment.model.Payment;
import com.fit.microservices.payment.model.PaymentMethod;
import com.fit.microservices.payment.model.PaymentStatus;
import com.fit.microservices.payment.producer.KafkaProducerService;
import com.fit.microservices.payment.repository.PaymentRepository;
import com.fit.microservices.payment.strategy.PaymentStrategy;
import com.fit.microservices.payment.strategy.PaymentStrategyRegistry;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/payment/callback")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentRepository paymentRepository;
    private final KafkaProducerService kafkaProducerService;
    private final PaymentStrategyRegistry strategyRegistry; // ← dùng registry thay vì inject cứng gateway
    private final ObjectMapper objectMapper;

    @Value("${payment.fe.returnUrl:http://localhost:5173/payment/return}")
    private String feReturnUrl;

    /**
     * Callback endpoint cho VNPay.
     * Nếu sau này thêm gateway khác (Momo, ZaloPay…), chỉ cần thêm
     * endpoint mới và gọi strategyRegistry.getStrategy("MOMO").verifyCallback(params).
     */
    @GetMapping("/vnpay")
    public ResponseEntity<Void> vnpayCallback(@RequestParam Map<String, String> params) {

        String txnRef = params.get("vnp_TxnRef");

        Payment payment = paymentRepository
                .findByTransactionId(txnRef)
                .orElse(null);

        if (payment == null) {
            return redirect(feReturnUrl + "?status=failed&reason=not_found");
        }

        // Idempotent – nếu đã xử lý thì redirect luôn
        if (payment.getStatus() != PaymentStatus.PENDING) {
            String status = payment.getStatus() == PaymentStatus.SUCCESS ? "success" : "failed";
            return redirect(feReturnUrl + "?status=" + status + "&orderId=" + payment.getOrderId());
        }

        // Xác minh chữ ký qua strategy — không hardcode VNPay logic ở đây
        PaymentStrategy strategy = strategyRegistry.getStrategy(PaymentMethod.VNPAY);
        boolean isValid = strategy.verifyCallback(params);

        String responseCode = params.get("vnp_ResponseCode");

        if (isValid && "00".equals(responseCode)) {
            payment.setStatus(PaymentStatus.SUCCESS);
            payment.setGatewayTransactionId(params.get("vnp_TransactionNo"));
            paymentRepository.save(payment);

            kafkaProducerService.sendPaymentCompleted(buildCompletedEvent(payment));

            return redirect(feReturnUrl
                    + "?status=success"
                    + "&orderId=" + payment.getOrderId()
                    + "&amount=" + payment.getAmount());

        } else {
            payment.setStatus(PaymentStatus.FAILED);
            paymentRepository.save(payment);

            kafkaProducerService.sendPaymentFailed(
                    new PaymentFailedEvent(payment.getOrderId(), "VNPay failed: " + responseCode));

            return redirect(feReturnUrl
                    + "?status=failed"
                    + "&orderId=" + payment.getOrderId()
                    + "&reason=" + responseCode);
        }
    }

    // ── Helpers ──────────────────────────────────────────────────────────

    private ResponseEntity<Void> redirect(String url) {
        return ResponseEntity.status(HttpStatus.FOUND)
                .location(URI.create(url))
                .build();
    }

    private PaymentCompletedEvent buildCompletedEvent(Payment payment) {
        List<PaymentCompletedEvent.OrderItem> items = null;

        if (payment.getItemsJson() != null && !payment.getItemsJson().isBlank()) {
            try {
                List<Map<String, Object>> rawItems = objectMapper.readValue(
                        payment.getItemsJson(), new TypeReference<>() {});
                items = rawItems.stream().map(m -> {
                    PaymentCompletedEvent.OrderItem item = new PaymentCompletedEvent.OrderItem();
                    item.setName((String) m.getOrDefault("name", ""));
                    item.setQuantity(((Number) m.getOrDefault("quantity", 1)).intValue());
                    item.setPrice(((Number) m.getOrDefault("price", 0)).doubleValue());
                    item.setSize((String) m.getOrDefault("size", ""));
                    item.setColor((String) m.getOrDefault("color", ""));
                    return item;
                }).collect(Collectors.toList());
            } catch (Exception ignored) {}
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
