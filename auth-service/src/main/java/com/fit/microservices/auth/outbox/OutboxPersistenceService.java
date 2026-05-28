package com.fit.microservices.auth.outbox;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Tách riêng transactional methods để tránh
 * self-invocation bypass Spring proxy.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class OutboxPersistenceService {

    private final OutboxEventRepository outboxEventRepository;

    /**
     * Load + lock rows trong transaction riêng.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public List<OutboxEvent> loadPending() {

        return outboxEventRepository
                .findTop50ByStatusOrderByCreatedAtAsc(
                        OutboxStatus.PENDING,
                        PageRequest.of(0, 50)
                );
    }

    /**
     * Persist kết quả publish.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void persistResults(List<OutboxEvent> events) {

        outboxEventRepository.saveAll(events);
    }
}