package com.fit.microservices.user.outbox;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.TimeUnit;

/**
 * THAY ĐỔI SO VỚI PHIÊN BẢN CŨ:
 * ─────────────────────────────────────────────────────────────
 * TRƯỚC: @Transactional + kafkaTemplate.send(...).get(5s) trong cùng method
 *        → DB connection bị giữ MỞ trong khi chờ Kafka (5s × N events)
 *        → Pool exhaustion khi load cao
 *
 * SAU:   Kafka send NẰM NGOÀI mọi @Transactional.
 *        DB operations được ủy thác cho UserOutboxPersistenceService
 *        với REQUIRES_NEW transaction ngắn (chỉ load/save, không I/O ngoài).
 *
 * Luồng:
 *   1. loadPending()     → TX mới: SELECT ... FOR UPDATE SKIP LOCKED → commit → giải phóng conn
 *   2. kafkaTemplate.send() → NGOÀI TX: không giữ DB connection
 *   3. persistResults()  → TX mới: batch UPDATE status → commit → giải phóng conn
 * ─────────────────────────────────────────────────────────────
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class OutboxPublisher {

    private static final int MAX_RETRIES = 5;

    private final UserOutboxPersistenceService persistenceService;
    private final KafkaTemplate<String, String> kafkaTemplate;

    @Scheduled(fixedDelay = 5_000)
    // KHÔNG có @Transactional ở đây — Kafka send phải nằm ngoài mọi transaction
    public void publishPendingEvents() {

        List<OutboxEvent> events = persistenceService.loadPending();

        if (events.isEmpty()) return;

        log.debug("[Outbox] Processing {} pending event(s)", events.size());

        for (OutboxEvent event : events) {
            try {
                // Blocking send để detect lỗi Kafka ngay — nằm NGOÀI @Transactional
                kafkaTemplate.send(event.getTopic(), event.getPayload())
                        .get(5, TimeUnit.SECONDS);

                event.setStatus(OutboxStatus.PUBLISHED);
                event.setPublishedAt(LocalDateTime.now());
                log.info("[Outbox] Published event id={} topic={}", event.getId(), event.getTopic());

            } catch (Exception e) {
                int newRetry = event.getRetryCount() + 1;
                event.setRetryCount(newRetry);

                if (newRetry >= MAX_RETRIES) {
                    event.setStatus(OutboxStatus.FAILED);
                    log.error("[Outbox] Event id={} topic={} FAILED after {} retries. Payload: {}",
                            event.getId(), event.getTopic(), newRetry, event.getPayload(), e);
                } else {
                    log.warn("[Outbox] Event id={} topic={} failed attempt {}/{}, will retry.",
                            event.getId(), event.getTopic(), newRetry, MAX_RETRIES);
                }
            }
        }

        // 1 batch UPDATE thay vì N lần save
        persistenceService.persistResults(events);
    }
}
