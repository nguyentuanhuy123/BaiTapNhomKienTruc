package com.fit.microservices.payment.service.gateway;

import com.fit.microservices.payment.model.Payment;

import java.util.Map;

/**
 * @deprecated Thay thế bởi {@link com.fit.microservices.payment.strategy.PaymentStrategy}.
 * Interface này còn giữ lại để không breaking change với các consumer khác.
 * Sẽ xoá trong version tiếp theo.
 */
@Deprecated(since = "2.0", forRemoval = true)
public interface PaymentGateway {
    String createPaymentUrl(Payment payment);
    boolean verifyCallback(Map<String, String> params);
}
