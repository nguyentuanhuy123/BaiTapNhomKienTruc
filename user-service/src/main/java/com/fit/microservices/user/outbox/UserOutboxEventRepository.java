package com.fit.microservices.user.outbox;

import jakarta.persistence.LockModeType;
import jakarta.persistence.QueryHint;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.QueryHints;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * THAY ĐỔI SO VỚI PHIÊN BẢN CŨ:
 * ─────────────────────────────────────────────────────────────
 * TRƯỚC: findTop50ByStatusOrderByCreatedAtAsc("PENDING")
 *        - Không có row-level lock
 *        - Khi deploy 2+ pod, cả hai đọc cùng 50 events
 *        - Kết quả: mỗi event được publish LÊN KAFKA 2 LẦN
 *
 * SAU:   SELECT ... FOR UPDATE SKIP LOCKED
 *        - Pod 1 lock row A, Pod 2 bỏ qua row A và lấy row B
 *        - Đảm bảo mỗi event chỉ được xử lý bởi 1 pod tại 1 thời điểm
 *        - jakarta.persistence.lock.timeout = -2 là magic value cho SKIP LOCKED
 *          (Hibernate 6 / Spring Boot 3+)
 * ─────────────────────────────────────────────────────────────
 * Lưu ý: Đổi tên thành UserOutboxEventRepository để tránh conflict
 * với OutboxEventRepository cũ (vẫn còn trong codebase nếu chưa xoá).
 * Khi đã migrate xong, xoá OutboxEventRepository cũ đi.
 */
@Repository
public interface UserOutboxEventRepository extends JpaRepository<OutboxEvent, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @QueryHints(
        @QueryHint(
            name = "jakarta.persistence.lock.timeout",
            value = "-2" // SKIP LOCKED — Hibernate 6+
        )
    )
    @Query("""
        SELECT e
        FROM OutboxEvent e
        WHERE e.status = com.fit.microservices.user.outbox.OutboxStatus.PENDING
        ORDER BY e.createdAt ASC
    """)
    List<OutboxEvent> findTop50PendingSkipLocked(Pageable pageable);

    default List<OutboxEvent> findTop50PendingSkipLocked() {
        return findTop50PendingSkipLocked(
            org.springframework.data.domain.PageRequest.of(0, 50)
        );
    }
}
