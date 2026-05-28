package com.fit.microservices.payment.strategy;

import com.fit.microservices.payment.dto.PaymentRequest;
import com.fit.microservices.payment.dto.PaymentResponse;
import com.fit.microservices.payment.model.Payment;
import com.fit.microservices.payment.model.PaymentMethod;

import java.util.Map;

/**
 * Strategy Pattern – mỗi phương thức thanh toán implement interface này.
 * Thêm phương thức mới = thêm class mới, không sửa code cũ (Open/Closed Principle).
 */
public interface PaymentStrategy {

    /** Phương thức thanh toán mà strategy này xử lý */
    PaymentMethod supportedMethod();

    /**
     * Khởi tạo thanh toán: set trạng thái, lưu DB, thực hiện side-effect (Kafka, URL…).
     * Trả về PaymentResponse để controller trả về FE.
     */
    PaymentResponse initiate(Payment payment, PaymentRequest request);

    /**
     * Xác minh callback từ cổng thanh toán (chỉ áp dụng cho online gateway).
     * Mặc định throw exception — COD hay các phương thức offline không cần override.
     */
    default boolean verifyCallback(Map<String, String> params) {
        throw new UnsupportedOperationException(
                supportedMethod() + " không hỗ trợ callback");
    }
}
