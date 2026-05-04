package com.fit.microservices.payment.config;

import com.fit.microservices.payment.utils.VnPayUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.stream.Collectors;
@Getter
@Setter
@Configuration
public class VNPAYConfig {

    @Value("${payment.vnPay.url}")
    private String vnp_PayUrl;

    @Value("${payment.vnPay.returnUrl}")
    private String vnp_ReturnUrl;

    @Value("${payment.vnPay.tmnCode}")
    private String vnp_TmnCode;

    @Value("${payment.vnPay.secretKey}")
    private String secretKey;

    @Value("${payment.vnPay.version}")
    private String vnp_Version;

    @Value("${payment.vnPay.command}")
    private String vnp_Command;

    @Value("${payment.vnPay.orderType}")
    private String orderType;

    public Map<String, String> getVNPayConfig() {

        Map<String, String> params = new HashMap<>();

        params.put("vnp_Version", vnp_Version);
        params.put("vnp_Command", vnp_Command);
        params.put("vnp_TmnCode", vnp_TmnCode);
        params.put("vnp_CurrCode", "VND");
        params.put("vnp_Locale", "vn");
        params.put("vnp_ReturnUrl", vnp_ReturnUrl);
        params.put("vnp_OrderType", orderType);

        TimeZone tz = TimeZone.getTimeZone("Asia/Ho_Chi_Minh");
        Calendar cal = Calendar.getInstance(tz);
        SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMddHHmmss");
        sdf.setTimeZone(tz);

        params.put("vnp_CreateDate", sdf.format(cal.getTime()));
        cal.add(Calendar.MINUTE, 15);
        params.put("vnp_ExpireDate", sdf.format(cal.getTime()));

        return params;
    }
}

