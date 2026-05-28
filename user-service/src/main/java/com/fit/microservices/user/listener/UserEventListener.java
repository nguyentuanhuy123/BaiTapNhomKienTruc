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

    /**
     * FIX: Chỉ broadcast ONLINE lên WebSocket.
     * KHÔNG gọi userStatusService.setUserOnline() ở đây — WebSocketEventListener
     * đã quản lý counter Redis (user:online:<id>) khi client mở WebSocket connection.
     * Gọi thêm ở đây sẽ double-count: counter bị +2 khi login (1 lần từ Kafka,
     * 1 lần từ WebSocket connect), dẫn đến user không bao giờ về trạng thái OFFLINE
     * sau khi đóng tab (vì phải decrement 2 lần nhưng chỉ có 1 disconnect event).
     */
    @KafkaListener(
            topics = "user-login-topic",
            groupId = "user-service"
    )
    public void handleUserLogin(String userId) {
        log.info("Received LOGIN event: {}", userId);
        Long uid = parseUserId(userId);

        // Chỉ broadcast — counter do WebSocketEventListener quản lý
        messagingTemplate.convertAndSend(
                "/topic/status",
                Map.of(
                        "userId", uid,
                        "status", "ONLINE"
                )
        );
    }

    /**
     * FIX: Chỉ broadcast OFFLINE lên WebSocket.
     * Tương tự handleUserLogin, KHÔNG gọi setUserOffline() ở đây.
     * WebSocketEventListener.handleDisconnect() sẽ decrement counter và
     * broadcast OFFLINE khi không còn tab nào mở.
     */
    @KafkaListener(
            topics = "user-logout-topic",
            groupId = "user-service"
    )
    public void handleUserLogout(String userId) {
        log.info("Received LOGOUT event: {}", userId);
        Long uid = parseUserId(userId);

        // Chỉ broadcast — counter do WebSocketEventListener quản lý
        messagingTemplate.convertAndSend(
                "/topic/status",
                Map.of(
                        "userId", uid,
                        "status", "OFFLINE"
                )
        );
    }

    /**
     * logout-all / force logout:
     * Đây là trường hợp đặc biệt — cần XOÁ HOÀN TOÀN counter Redis
     * (forceUserOffline) vì user bị đăng xuất khỏi mọi thiết bị.
     * WebSocket clients sẽ ngắt kết nối sau khi nhận FORCE_LOGOUT,
     * nhưng lúc đó counter đã bị xóa nên handleDisconnect sẽ không
     * broadcast thêm OFFLINE nữa (decrement trên key không tồn tại → -1 → delete → 0L,
     * nhưng client đã nhận FORCE_LOGOUT rồi nên OFFLINE sau đó là vô hại).
     */
    @KafkaListener(
            topics = "user-logout-all-topic",
            groupId = "user-service"
    )
    public void handleUserLogoutAll(String userId) {
        log.info("Received LOGOUT ALL event: {}", userId);
        Long uid = parseUserId(userId);

        // Force clear counter — hợp lệ vì user bị đăng xuất toàn bộ session
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
