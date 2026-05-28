package com.fit.microservices.notification.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * SMS Service (DEMO MODE)
 *
 * Hiện tại:
 * - Không gửi SMS thật
 * - OTP sẽ được gửi qua email để demo
 *
 * Sau này có thể thay bằng:
 * - Twilio
 * - Vonage
 * - ESMS
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class SmsService {

    private final EmailService emailService;

    /**
     * Demo send OTP
     *
     * @param phone số điện thoại user nhập
     * @param email email account để nhận OTP demo
     * @param otp   mã OTP
     */
    public void sendOtpSms(String phone, String email, String otp) {

        // DEMO:
        // gửi OTP qua email thay vì SMS thật
        emailService.sendOtpEmail(email, otp);

        log.info("╔══════════════════════════════════════════╗");
        log.info("║ [SMS DEMO -> EMAIL]");
        log.info("║ Phone : {}", phone);
        log.info("║ Email : {}", email);
        log.info("║ OTP   : {}", otp);
        log.info("╚══════════════════════════════════════════╝");
    }
}