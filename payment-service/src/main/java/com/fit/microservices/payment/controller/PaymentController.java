package com.fit.microservices.payment.controller;

import com.fit.microservices.payment.event.PaymentCompletedEvent;
import com.fit.microservices.payment.event.PaymentFailedEvent;
import com.fit.microservices.payment.model.Payment;
import com.fit.microservices.payment.model.PaymentStatus;
import com.fit.microservices.payment.producer.KafkaProducerService;
import com.fit.microservices.payment.repository.PaymentRepository;
import com.fit.microservices.payment.service.gateway.PaymentGateway;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/payment/callback")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentRepository paymentRepository;
    private final KafkaProducerService kafkaProducerService;
    private final PaymentGateway paymentGateway;

    @GetMapping("/vnpay")
    public ResponseEntity<String> callback(
            @RequestParam Map<String, String> params) {

//        // 1️⃣ Verify chữ ký
//        if (!paymentGateway.verifyCallback(new HashMap<>(params))) {
//            return ResponseEntity.badRequest().body("Invalid signature");
//        }

        // 2️⃣ Lấy transactionId của hệ thống
        String txnRef = params.get("vnp_TxnRef");
        String responseCode = params.get("vnp_ResponseCode");

        Payment payment = paymentRepository
                .findByTransactionId(txnRef)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        // 3️⃣ Idempotent
        if (payment.getStatus() != PaymentStatus.PENDING) {
            return ResponseEntity.ok("Payment already processed");
        }

        // 4️⃣ Xử lý kết quả
        if ("00".equals(responseCode)) {
            payment.setStatus(PaymentStatus.SUCCESS);
            payment.setGatewayTransactionId(
                    params.get("vnp_TransactionNo")
            );

            kafkaProducerService.sendPaymentCompleted(
                    new PaymentCompletedEvent(
                            payment.getOrderId(),
                            payment.getTransactionId(),
                            payment.getAmount().doubleValue()
                    )
            );

        } else {
            payment.setStatus(PaymentStatus.FAILED);

            kafkaProducerService.sendPaymentFailed(
                    new PaymentFailedEvent(
                            payment.getOrderId(),
                            "VNPay failed: " + responseCode
                    )
            );
        }

        paymentRepository.save(payment);
        return ResponseEntity.ok("Payment processed");
    }
}

