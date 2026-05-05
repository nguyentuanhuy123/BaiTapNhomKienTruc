package com.fit.microservices.notification.listener;

import com.fit.microservices.notification.event.ForgotPasswordEvent;
import com.fit.microservices.notification.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class AuthEventListener {

    private final EmailService emailService;

    @KafkaListener(topics = "user-forgot-password-topic", groupId = "notification-group")
    public void handleForgotPasswordEvent(ForgotPasswordEvent event) {
        log.info("Received forgot password event for email: {}", event.getEmail());
        emailService.sendPasswordResetEmail(event.getEmail(), event.getResetToken());
    }

    @KafkaListener(topics = "user-otp-topic", groupId = "notification-group")
    public void handleOtpEvent(Map<String, String> payload) {
        String email = payload.get("email");
        String otp = payload.get("otp");
        emailService.sendOtpEmail(email, otp);
    }
}