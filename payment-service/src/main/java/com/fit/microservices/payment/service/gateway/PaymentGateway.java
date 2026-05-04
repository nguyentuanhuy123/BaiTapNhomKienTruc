package com.fit.microservices.payment.service.gateway;

import com.fit.microservices.payment.model.Payment;

import java.util.Map;

public interface PaymentGateway {
    String createPaymentUrl(Payment payment);
    boolean verifyCallback(Map<String, String> params);
}
