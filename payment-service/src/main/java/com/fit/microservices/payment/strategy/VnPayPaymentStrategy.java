package com.fit.microservices.payment.strategy;

import com.fit.microservices.payment.config.VNPAYConfig;
import com.fit.microservices.payment.dto.PaymentRequest;
import com.fit.microservices.payment.dto.PaymentResponse;
import com.fit.microservices.payment.model.Payment;
import com.fit.microservices.payment.model.PaymentMethod;
import com.fit.microservices.payment.model.PaymentStatus;
import com.fit.microservices.payment.repository.PaymentRepository;
import com.fit.microservices.payment.utils.VnPayUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

/**
 * Strategy cho VNPay:
 * - Tạo payment URL để FE redirect sang cổng VNPay
 * - Xác minh chữ ký callback khi VNPay redirect về
 */
@Component
@RequiredArgsConstructor
public class VnPayPaymentStrategy implements PaymentStrategy {

    private final VNPAYConfig vnPayConfig;
    private final PaymentRepository paymentRepository;

    @Override
    public PaymentMethod supportedMethod() {
        return PaymentMethod.VNPAY;
    }

    @Override
    public PaymentResponse initiate(Payment payment, PaymentRequest request) {
        payment.setMethod(PaymentMethod.VNPAY);
        payment.setStatus(PaymentStatus.PENDING);
        paymentRepository.save(payment);

        String paymentUrl = createPaymentUrl(payment);
        payment.setPaymentUrl(paymentUrl);
        paymentRepository.save(payment);

        return new PaymentResponse(payment.getOrderId(), "PENDING", paymentUrl, null);
    }

    @Override
    public boolean verifyCallback(Map<String, String> params) {
        String secureHash = params.remove("vnp_SecureHash");
        String signData = VnPayUtil.getPaymentURL(params, false);
        String hash = VnPayUtil.hmacSHA512(vnPayConfig.getSecretKey(), signData);
        return hash.equals(secureHash);
    }

    // ── Private helpers ──────────────────────────────────────────────────

    private String createPaymentUrl(Payment payment) {
        Map<String, String> vnpParams = new HashMap<>();

        vnpParams.put("vnp_Version",   vnPayConfig.getVnp_Version());
        vnpParams.put("vnp_Command",   vnPayConfig.getVnp_Command());
        vnpParams.put("vnp_TmnCode",   vnPayConfig.getVnp_TmnCode());
        vnpParams.put("vnp_CurrCode",  "VND");
        vnpParams.put("vnp_Locale",    "vn");
        vnpParams.put("vnp_ReturnUrl", vnPayConfig.getVnp_ReturnUrl());
        vnpParams.put("vnp_OrderType", vnPayConfig.getOrderType());
        vnpParams.put("vnp_IpAddr",    "127.0.0.1");
        vnpParams.put("vnp_TxnRef",    payment.getTransactionId());
        vnpParams.put("vnp_OrderInfo", "Thanh toan don hang " + payment.getOrderId());

        // Amount * 100 (VNPay yêu cầu số nguyên VND * 100)
        vnpParams.put("vnp_Amount",
                payment.getAmount()
                        .multiply(BigDecimal.valueOf(100))
                        .toBigInteger()
                        .toString());

        ZonedDateTime now = ZonedDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh"));
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
        vnpParams.put("vnp_CreateDate", now.format(fmt));
        vnpParams.put("vnp_ExpireDate", now.plusMinutes(15).format(fmt));

        String query      = VnPayUtil.getPaymentURL(vnpParams, true);
        String secureHash = VnPayUtil.hmacSHA512(vnPayConfig.getSecretKey(), query);

        return vnPayConfig.getVnp_PayUrl() + "?" + query + "&vnp_SecureHash=" + secureHash;
    }
}
