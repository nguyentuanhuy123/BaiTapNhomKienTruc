package com.fit.microservices.user.controller;

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
    private final SimpMessagingTemplate messagingTemplate; // Thêm bean này

    @KafkaListener(topics = "user-login-topic", groupId = "user-service")
    public void handleUserLogin(String userId) {
        log.info("Received LOGIN event for user: {}", userId);
        Long uid = Long.parseLong(userId);
        userStatusService.setUserOnline(uid);

        // Broadcast trạng thái ONLINE
        messagingTemplate.convertAndSend("/topic/status", Map.of(
                "userId", uid,
                "status", "ONLINE"
        ));
    }

    @KafkaListener(topics = "user-logout-topic", groupId = "user-service")
    public void handleUserLogout(String userId) {
        log.info("Received LOGOUT event for user: {}", userId);
        Long uid = Long.parseLong(userId);
        userStatusService.setUserOffline(uid);

        // Broadcast trạng thái OFFLINE
        messagingTemplate.convertAndSend("/topic/status", Map.of(
                "userId", uid,
                "status", "OFFLINE"
        ));
    }

    @KafkaListener(topics = "user-logout-all-topic", groupId = "user-service")
    public void handleUserLogoutAll(String userId) {
        log.info("Received LOGOUT ALL event for user: {}", userId);
        Long uid = Long.parseLong(userId);

        // Gọi hàm force để xóa ngay lập tức mọi session
        userStatusService.forceUserOffline(uid);

        messagingTemplate.convertAndSend("/topic/status", Map.of(
                "userId", uid,
                "status", "OFFLINE"
        ));
    }

    @KafkaListener(topics = "user-forgot-password-topic", groupId = "user-service")
    public void handleUserForgotPassword(Map<String, String> payload) {
        String email = payload.get("email");
        log.info("Received FORGOT PASSWORD event for email: {}", email);

        messagingTemplate.convertAndSend("/topic/alerts", Map.of(
                "email", email,
                "message", "Một yêu cầu thay đổi mật khẩu đã được thực hiện."
        ));
    }
}