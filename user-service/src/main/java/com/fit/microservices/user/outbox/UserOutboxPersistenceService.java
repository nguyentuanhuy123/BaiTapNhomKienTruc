package com.fit.microservices.user.outbox;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Tách riêng các DB operations vào transaction ngắn,
 * tránh self-invocation bypass Spring proxy.
 *
 * Pattern giống auth-service/OutboxPersistenceService:
 *  - loadPending(): mở TX mới, load + lock rows, đóng TX → giải phóng DB conn
 *  - persistResults(): mở TX mới, batch UPDATE, đóng TX
 *
 * Kafka send NẰM NGOÀI cả hai TX này (trong OutboxPublisher).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class UserOutboxPersistenceService {

    private final UserOutboxEventRepository outboxEventRepository;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public List<OutboxEvent> loadPending() {
        return outboxEventRepository.findTop50PendingSkipLocked();
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void persistResults(List<OutboxEvent> events) {
        outboxEventRepository.saveAll(events);
    }
}
