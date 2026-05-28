package com.fit.microservices.payment.service;

import com.fit.microservices.payment.dto.PaymentRequest;
import com.fit.microservices.payment.dto.PaymentResponse;
import com.fit.microservices.payment.event.InventoryReservedEvent;

public interface PaymentService {

    /** Xử lý payment qua Kafka flow (inventory reserved) */
    PaymentResponse processPayment(InventoryReservedEvent event);

    /** Khởi tạo payment từ checkout FE (COD hoặc VNPay) */
    PaymentResponse initiatePayment(PaymentRequest request);
}
