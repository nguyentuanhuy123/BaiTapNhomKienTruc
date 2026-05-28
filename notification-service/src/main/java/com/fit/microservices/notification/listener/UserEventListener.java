package com.fit.microservices.notification.listener;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fit.microservices.notification.service.SmsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class UserEventListener {

    private final SmsService smsService;
    private final ObjectMapper objectMapper;

    /**
     * Dùng ConsumerRecord<String, String> để bypass JsonMessageConverter của Spring.
     * Lỗi xảy ra vì converter cố ép JSON object → String → fail.
     * ConsumerRecord nhận raw bytes từ Kafka rồi để ta tự xử lý — không qua converter.
     */
    @KafkaListener(
            topics     = "user-phone-otp-topic",
            groupId    = "notification-service-group",
            properties = {
                    "value.deserializer=org.apache.kafka.common.serialization.StringDeserializer"
            }
    )
    public void handlePhoneOtpEvent(ConsumerRecord<String, String> record) {
        try {
            String rawPayload = record.value();

            Map<String, String> payload = objectMapper.readValue(
                    rawPayload,
                    new TypeReference<Map<String, String>>() {}
            );

            String phone = payload.get("phone");
            String otp   = payload.get("otp");
            String email = payload.get("email");

            log.info("[PhoneOTP] Nhận OTP request: phone={}, email={}", phone, email);
            smsService.sendOtpSms(phone, email, otp);

        } catch (Exception e) {
            log.error("[PhoneOTP] Lỗi xử lý message: {} | raw={}", e.getMessage(), record.value());
        }
    }
}
