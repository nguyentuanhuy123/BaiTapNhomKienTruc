package com.fit.microservices.user.outbox;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface OutboxEventRepository extends JpaRepository<OutboxEvent, Long> {

    List<OutboxEvent> findTop50ByStatusOrderByCreatedAtAsc(String status);
    @Modifying
    @Query("DELETE FROM OutboxEvent e WHERE e.status IN :statuses AND e.createdAt < :before")
    int deleteByStatusInAndCreatedAtBefore(
            @Param("statuses") List<OutboxStatus> statuses,
            @Param("before") LocalDateTime before
    );
}