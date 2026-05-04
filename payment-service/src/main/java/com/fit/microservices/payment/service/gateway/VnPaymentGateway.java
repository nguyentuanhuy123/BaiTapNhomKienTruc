package com.fit.microservices.payment.service.gateway;

import com.fit.microservices.payment.config.VNPAYConfig;
import com.fit.microservices.payment.model.Payment;
import com.fit.microservices.payment.utils.VnPayUtil;
import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class VnPaymentGateway implements PaymentGateway {

    private final VNPAYConfig vnPayConfig;

//    @Override
//    public String createPaymentUrl(Payment payment) {
//
//        Map<String, String> vnpParams = vnPayConfig.getVNPayConfig();
//
//        // BẮT BUỘC
//        vnpParams.put("vnp_TxnRef", payment.getTransactionId());
//        vnpParams.put("vnp_OrderInfo",
//                "Thanh toan don hang " + payment.getOrderId());
//        vnpParams.put("vnp_OrderType", "other");
//        vnpParams.put("vnp_Locale", "vn");
//        vnpParams.put("vnp_CurrCode", "VND");
//
//        // Amount = VND * 100 (SỐ NGUYÊN)
//        vnpParams.put(
//                "vnp_Amount",
//                payment.getAmount()
//                        .multiply(BigDecimal.valueOf(100))
//                        .toBigInteger()
//                        .toString()
//        );
//
//        // DATE – BẮT BUỘC
//        ZonedDateTime now = ZonedDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh"));
//        DateTimeFormatter formatter =
//                DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
//
//        vnpParams.put("vnp_CreateDate", now.format(formatter));
//        vnpParams.put("vnp_ExpireDate",
//                now.plusMinutes(15).format(formatter));
//
//        // BUILD QUERY + HASH
//        String query = VnPayUtil.getPaymentURL(vnpParams, true);
//        String secureHash = VnPayUtil.hmacSHA512(
//                vnPayConfig.getSecretKey(), query
//        );
//
//        return vnPayConfig.getVnp_PayUrl()
//                + "?" + query
//                + "&vnp_SecureHash=" + secureHash;
//    }
@Override
public String createPaymentUrl(Payment payment) {

    Map<String, String> vnpParams = new HashMap<>();

    vnpParams.put("vnp_Version", vnPayConfig.getVnp_Version());
    vnpParams.put("vnp_Command", vnPayConfig.getVnp_Command());
    vnpParams.put("vnp_TmnCode", vnPayConfig.getVnp_TmnCode());
    vnpParams.put("vnp_CurrCode", "VND");
    vnpParams.put("vnp_Locale", "vn");
    vnpParams.put("vnp_ReturnUrl", vnPayConfig.getVnp_ReturnUrl());
    vnpParams.put("vnp_OrderType", vnPayConfig.getOrderType());
    vnpParams.put("vnp_IpAddr", "127.0.0.1");
    vnpParams.put("vnp_TxnRef", payment.getTransactionId());
    vnpParams.put(
            "vnp_OrderInfo",
            "Thanh toan don hang " + payment.getOrderId()
    );

    // AMOUNT * 100 (SỐ NGUYÊN)
    vnpParams.put(
            "vnp_Amount",
            payment.getAmount()
                    .multiply(BigDecimal.valueOf(100))
                    .toBigInteger()
                    .toString()
    );

    ZonedDateTime now = ZonedDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh"));
    DateTimeFormatter formatter =
            DateTimeFormatter.ofPattern("yyyyMMddHHmmss");

    vnpParams.put("vnp_CreateDate", now.format(formatter));
    vnpParams.put("vnp_ExpireDate",
            now.plusMinutes(15).format(formatter));

    String query = VnPayUtil.getPaymentURL(vnpParams, true);
    String secureHash = VnPayUtil.hmacSHA512(
            vnPayConfig.getSecretKey(), query
    );

    return vnPayConfig.getVnp_PayUrl()
            + "?" + query
            + "&vnp_SecureHash=" + secureHash;
}


    @Override
    public boolean verifyCallback(Map<String, String> params) {
        String secureHash = params.remove("vnp_SecureHash");
        String signData = VnPayUtil.getPaymentURL(params, false);
        String hash = VnPayUtil.hmacSHA512(
                vnPayConfig.getSecretKey(), signData
        );
        return hash.equals(secureHash);
    }
}





