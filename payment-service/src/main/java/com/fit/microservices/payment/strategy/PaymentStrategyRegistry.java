package com.fit.microservices.payment.strategy;

import com.fit.microservices.payment.model.PaymentMethod;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Registry (Context) của Strategy Pattern.
 *
 * Spring tự inject tất cả bean implement PaymentStrategy vào đây.
 * Để thêm phương thức thanh toán mới:
 *   1. Tạo class mới implement PaymentStrategy
 *   2. Annotate @Component
 *   → Registry tự nhận ra, không cần sửa gì thêm.
 */
@Component
public class PaymentStrategyRegistry {

    private final Map<PaymentMethod, PaymentStrategy> strategyMap;

    public PaymentStrategyRegistry(List<PaymentStrategy> strategies) {
        this.strategyMap = strategies.stream()
                .collect(Collectors.toMap(PaymentStrategy::supportedMethod, s -> s));
    }

    /**
     * Lấy strategy theo tên (string từ request của FE, vd: "COD", "VNPAY").
     *
     * @throws IllegalArgumentException nếu không tìm thấy strategy phù hợp
     */
    public PaymentStrategy getStrategy(String methodName) {
        try {
            PaymentMethod method = PaymentMethod.valueOf(methodName.toUpperCase());
            return getStrategy(method);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException(
                    "Phương thức thanh toán không được hỗ trợ: " + methodName);
        }
    }

    /**
     * Lấy strategy theo enum PaymentMethod.
     *
     * @throws IllegalArgumentException nếu không tìm thấy strategy phù hợp
     */
    public PaymentStrategy getStrategy(PaymentMethod method) {
        PaymentStrategy strategy = strategyMap.get(method);
        if (strategy == null) {
            throw new IllegalArgumentException(
                    "Phương thức thanh toán không được hỗ trợ: " + method);
        }
        return strategy;
    }
}
