package com.fit.microservices.user.controller;

import com.fit.microservices.user.service.UserStatusService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class WebSocketEventListener {

    private final UserStatusService userStatusService;
    private final SimpMessagingTemplate messagingTemplate;

    @EventListener
    public void handleConnect(SessionConnectEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        String userId = accessor.getFirstNativeHeader("userId");

        if (userId != null && !userId.isEmpty()) {
            try {
                Long uid = Long.parseLong(userId);
                userStatusService.setUserOnline(uid);
                accessor.getSessionAttributes().put("userId", userId);
                log.info("User {} connected", userId);
                // Sửa lại thành Map
                messagingTemplate.convertAndSend("/topic/status", Map.of(
                        "userId", uid,
                        "status", "ONLINE"
                ));
            } catch (NumberFormatException e) {
                log.error("UserId không đúng định dạng số: {}", userId);
            }
        } else {
            log.warn("Kết nối WebSocket thiếu userId header!");
        }
    }

    @EventListener
    public void handleDisconnect(SessionDisconnectEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        String userId = (String) accessor.getSessionAttributes().get("userId");

        if (userId != null) {
            userStatusService.setUserOffline(Long.parseLong(userId));
            log.info("User {} disconnected", userId);
            // Sửa lại thành Map
            messagingTemplate.convertAndSend("/topic/status", Map.of(
                    "userId", Long.parseLong(userId),
                    "status", "OFFLINE"
            ));
        }
    }

}
