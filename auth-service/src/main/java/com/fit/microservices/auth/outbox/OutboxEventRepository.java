package com.fit.microservices.auth.outbox;

import jakarta.persistence.LockModeType;
import jakarta.persistence.QueryHint;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OutboxEventRepository extends JpaRepository<OutboxEvent, Long> {

    /**
     * Load tối đa 50 event PENDING và lock row để tránh
     * nhiều instance publish trùng.
     *
     * Hibernate 6 + Spring Boot 3:
     * dùng jakarta.persistence.lock.timeout = -2
     * để bật SKIP LOCKED.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @QueryHints(
            @QueryHint(
                    name = "jakarta.persistence.lock.timeout",
                    value = "-2"
            )
    )
    @Query("""
        SELECT e
        FROM OutboxEvent e
        WHERE e.status = :status
        ORDER BY e.createdAt ASC
    """)
    List<OutboxEvent> findTop50ByStatusOrderByCreatedAtAsc(
            @Param("status") OutboxStatus status,
            Pageable pageable
    );
    @Modifying
    @Query("DELETE FROM OutboxEvent e WHERE e.status IN :statuses AND e.createdAt < :before")
    int deleteByStatusInAndCreatedAtBefore(
            @Param("statuses") List<OutboxStatus> statuses,
            @Param("before") LocalDateTime before
    );
}