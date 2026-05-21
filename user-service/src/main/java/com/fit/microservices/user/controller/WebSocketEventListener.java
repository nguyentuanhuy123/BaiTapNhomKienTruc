package com.fit.microservices.user.controller;

import com.fit.microservices.user.service.UserStatusService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class WebSocketEventListener {

    private final UserStatusService userStatusService;
    private final SimpMessagingTemplate messagingTemplate;

    @EventListener
    public void handleConnect(SessionConnectedEvent event) { // Dùng SessionConnectedEvent
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        // Lấy userId từ header lúc connect (Frontend phải gửi header này)
        String userId = accessor.getFirstNativeHeader("userId");

        if (userId != null && !userId.isEmpty()) {
            try {
                Long uid = Long.parseLong(userId);
                Long activeSessions = userStatusService.setUserOnline(uid);

                // Lưu userId vào SessionAttributes để dùng lúc Disconnect
                accessor.getSessionAttributes().put("userId", userId);

                log.info("User {} connected. SessionID: {}. Active: {}",
                        userId, accessor.getSessionId(), activeSessions);

                // CHỈ gửi ONLINE cho mọi người nếu đây là tab duy nhất vừa mở
                if (activeSessions != null && activeSessions == 1) {
                    messagingTemplate.convertAndSend("/topic/status", Map.of(
                            "userId", uid,
                            "status", "ONLINE"
                    ));
                }
            } catch (NumberFormatException e) {
                log.error("Lỗi định dạng UserId: {}", userId);
            }
        }
    }

    @EventListener
    public void handleDisconnect(SessionDisconnectEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        String userIdStr = (String) accessor.getSessionAttributes().get("userId");

        if (userIdStr != null) {
            try {
                Long uid = Long.parseLong(userIdStr);
                // Giảm số lượng session và lấy giá trị còn lại
                Long remainingSessions = userStatusService.setUserOffline(uid);

                log.info("User {} disconnected. Remaining sessions: {}", uid, remainingSessions);

                // 🔥 CHỈ gửi OFFLINE nếu không còn tab nào mở (count == 0)
                if (remainingSessions != null && remainingSessions <= 0) {
                    messagingTemplate.convertAndSend("/topic/status", Map.of(
                            "userId", uid,
                            "status", "OFFLINE"
                    ));
                }
            } catch (Exception e) {
                log.error("Lỗi khi xử lý disconnect cho user {}: {}", userIdStr, e.getMessage());
            }
        }
    }
}
