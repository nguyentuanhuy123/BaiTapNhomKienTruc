package com.fit.microservices.user.listener;

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

    // ✅ FIX: strip JSON quotes trước khi parseLong
    // auth-service dùng JsonSerializer nên produce "1" (có quotes), không phải 1
    private Long parseUserId(String raw) {
        return Long.parseLong(raw.replace("\"", "").trim());
    }

    @KafkaListener(topics = "user-login-topic", groupId = "user-service")
    public void handleUserLogin(String userId) {
        log.info("Received LOGIN event for user: {}", userId);
        Long uid = parseUserId(userId);
        userStatusService.setUserOnline(uid);
        messagingTemplate.convertAndSend("/topic/status", Map.of(
                "userId", uid,
                "status", "ONLINE"
        ));
    }

    @KafkaListener(topics = "user-logout-topic", groupId = "user-service")
    public void handleUserLogout(String userId) {
        log.info("Received LOGOUT event for user: {}", userId);
        Long uid = parseUserId(userId);
        userStatusService.setUserOffline(uid);
        messagingTemplate.convertAndSend("/topic/status", Map.of(
                "userId", uid,
                "status", "OFFLINE"
        ));
    }

    @KafkaListener(topics = "user-logout-all-topic", groupId = "user-service")
    public void handleUserLogoutAll(String userId) {
        log.info("Received LOGOUT ALL event for user: {}", userId);
        Long uid = parseUserId(userId);

        userStatusService.forceUserOffline(uid);

        messagingTemplate.convertAndSend("/topic/status", Map.of(
                "userId", uid,
                "status", "FORCE_LOGOUT",
                "reason", "LOGOUT_ALL"
        ));
    }
}