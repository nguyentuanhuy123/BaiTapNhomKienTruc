package com.fit.microservices.auth.outbox;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

// OutboxCleanupJob.java (thêm vào cả auth-service và user-service)
@Component
@RequiredArgsConstructor
@Slf4j
public class OutboxCleanupJob {

    private final OutboxEventRepository outboxEventRepository; // hoặc UserOutboxEventRepository

    // Chạy lúc 3 giờ sáng mỗi ngày
    @Scheduled(cron = "0 0 3 * * *")
    @Transactional
    public void cleanupProcessedEvents() {
        LocalDateTime cutoff = LocalDateTime.now().minusDays(7);
        // Xóa PUBLISHED/PUBLISHED và FAILED cũ hơn 7 ngày
        int deleted = outboxEventRepository.deleteByStatusInAndCreatedAtBefore(
                List.of(OutboxStatus.PUBLISHED, OutboxStatus.PUBLISHED, OutboxStatus.FAILED),
                cutoff
        );
        log.info("[OutboxCleanup] Đã xóa {} event cũ hơn 7 ngày", deleted);
    }
}
