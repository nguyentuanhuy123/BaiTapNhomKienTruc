package com.fit.microservices.payment.controller;

import com.fit.microservices.payment.dto.PaymentRequest;
import com.fit.microservices.payment.dto.PaymentResponse;
import com.fit.microservices.payment.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // Cho phép FE dev server gọi trực tiếp
public class PaymentInitiateController {

    private final PaymentService paymentService;

    /**
     * FE gọi endpoint này khi người dùng bấm "Place Order" ở checkout.
     * - COD  → trả về { status: "SUCCESS" } ngay, đồng thời gửi email qua Kafka
     * - VNPay → trả về { status: "PENDING", paymentUrl: "https://..." } để FE redirect
     */
    @PostMapping("/initiate")
    public ResponseEntity<PaymentResponse> initiate(@RequestBody PaymentRequest request) {
        PaymentResponse response = paymentService.initiatePayment(request);
        return ResponseEntity.ok(response);
    }
}
