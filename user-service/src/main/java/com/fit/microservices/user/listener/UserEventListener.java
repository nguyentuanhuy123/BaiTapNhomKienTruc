package com.fit.microservices.user.listener;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fit.microservices.user.service.UserStatusService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class UserEventListener {

    private final UserStatusService userStatusService;
    private final SimpMessagingTemplate messagingTemplate;
    private final ObjectMapper objectMapper;

    /**
     * Parse Kafka payload an toàn.
     *
     * Hỗ trợ:
     * - 5
     * - "5"
     * - "\"5\""
     */
    private Long parseUserId(String raw) {
        try {
            log.info("[Kafka] Raw payload = [{}]", raw);

            // CASE 1: plain JSON number  →  5
            try {
                return objectMapper.readValue(raw, Long.class);
            } catch (Exception ignored) {}

            // CASE 2: JSON string  →  "5"
            String cleaned = objectMapper.readValue(raw, String.class);

            // CASE 3: double-encoded JSON string  →  "\"5\""  unwraps to  "5"
            //         Try to unwrap one more layer if it looks like a JSON string
            if (cleaned.startsWith("\"") && cleaned.endsWith("\"")) {
                try {
                    cleaned = objectMapper.readValue(cleaned, String.class);
                } catch (Exception ignored) {}
            }

            return Long.parseLong(cleaned.trim());

        } catch (Exception e) {
            log.error("❌ Parse userId failed: {}", raw, e);
            throw new RuntimeException("Invalid userId payload: " + raw);
        }
    }

    @KafkaListener(
            topics = "user-login-topic",
            groupId = "user-service"
    )
    public void handleUserLogin(String userId) {

        log.info("Received LOGIN event: {}", userId);

        Long uid = parseUserId(userId);

        userStatusService.setUserOnline(uid);

        messagingTemplate.convertAndSend(
                "/topic/status",
                Map.of(
                        "userId", uid,
                        "status", "ONLINE"
                )
        );
    }

    @KafkaListener(
            topics = "user-logout-topic",
            groupId = "user-service"
    )
    public void handleUserLogout(String userId) {

        log.info("Received LOGOUT event: {}", userId);

        Long uid = parseUserId(userId);

        userStatusService.setUserOffline(uid);

        messagingTemplate.convertAndSend(
                "/topic/status",
                Map.of(
                        "userId", uid,
                        "status", "OFFLINE"
                )
        );
    }

    @KafkaListener(
            topics = "user-logout-all-topic",
            groupId = "user-service"
    )
    public void handleUserLogoutAll(String userId) {

        log.info("Received LOGOUT ALL event: {}", userId);

        Long uid = parseUserId(userId);

        userStatusService.forceUserOffline(uid);

        messagingTemplate.convertAndSend(
                "/topic/status",
                Map.of(
                        "userId", uid,
                        "status", "FORCE_LOGOUT",
                        "reason", "LOGOUT_ALL"
                )
        );
    }
}