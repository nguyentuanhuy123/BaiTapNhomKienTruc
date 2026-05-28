package com.fit.microservices.auth.outbox;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.TimeUnit;

/**
 * Poll bảng outbox_events mỗi 5 giây
 * và publish event lên Kafka.
 *
 * Improvements:
 *  - dùng SKIP LOCKED tránh double publish
 *  - transaction ngắn
 *  - Kafka send nằm ngoài transaction
 *  - saveAll chỉ gọi 1 lần
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class OutboxEventPublisher {

    private static final int MAX_RETRIES = 5;

    private final OutboxPersistenceService persistenceService;
    private final KafkaTemplate<String, String> kafkaTemplate;

    @Scheduled(fixedDelay = 1000)
    public void processOutboxEvents() {

        // Load events cần publish
        List<OutboxEvent> pendingEvents =
                persistenceService.loadPending();

        if (pendingEvents.isEmpty()) {
            return;
        }

        log.info(
                "[Outbox] Processing {} pending event(s)",
                pendingEvents.size()
        );

        // Publish ngoài transaction
        for (OutboxEvent event : pendingEvents) {

            try {

                kafkaTemplate.send(
                        event.getTopic(),
                        event.getPayload()
                ).get(5, TimeUnit.SECONDS);

                event.setStatus(OutboxStatus.PUBLISHED);
                event.setPublishedAt(LocalDateTime.now());

                log.info(
                        "[Outbox] Published event id={} topic={}",
                        event.getId(),
                        event.getTopic()
                );

            } catch (Exception e) {

                int newRetry = event.getRetryCount() + 1;

                event.setRetryCount(newRetry);

                if (newRetry >= MAX_RETRIES) {

                    event.setStatus(OutboxStatus.FAILED);

                    log.error(
                            "[Outbox] Event id={} topic={} FAILED after {} retries",
                            event.getId(),
                            event.getTopic(),
                            newRetry,
                            e
                    );

                } else {

                    log.warn(
                            "[Outbox] Retry {}/{} for event id={} topic={}",
                            newRetry,
                            MAX_RETRIES,
                            event.getId(),
                            event.getTopic()
                    );
                }
            }
        }

        // Persist trạng thái sau khi xử lý xong batch
        persistenceService.persistResults(pendingEvents);
    }
}