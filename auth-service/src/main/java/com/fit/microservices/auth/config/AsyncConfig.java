package com.fit.microservices.auth.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;
import java.util.concurrent.ThreadPoolExecutor;

/**
 * Cấu hình Thread Pool cho các tác vụ @Async trong auth-service.
 *
 * Tại sao cần AsyncConfig?
 * ─────────────────────────────────────────────────────────────────
 * - Spring Boot mặc định dùng SimpleAsyncTaskExecutor: tạo thread mới mỗi lần gọi.
 *   → Khi có nghìn request, hàng nghìn thread được tạo → OOM / thrashing.
 * - ThreadPoolTaskExecutor dùng pool cố định với queue đệm:
 *   · corePoolSize:  luôn giữ sẵn để phục vụ ngay (ít request)
 *   · maxPoolSize:   scale lên khi queue đầy (nhiều request)
 *   · queueCapacity: hấp thụ burst traffic trước khi scale thread
 *   → Tắt dần thread idle khi load giảm (tiết kiệm tài nguyên)
 *
 * Dùng cho:
 * - @Async methods trong service layer (nếu có)
 * - @Scheduled tasks (OutboxEventPublisher dùng pool riêng của Scheduler)
 */
@Configuration
@EnableAsync
public class AsyncConfig {

    @Bean(name = "taskExecutor")
    public Executor taskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();

        // Số thread luôn sống dù không có việc — đáp ứng ngay khi có request
        executor.setCorePoolSize(10);

        // Scale tối đa khi queue đầy — đủ cho burst traffic
        executor.setMaxPoolSize(50);

        // Buffer request khi tất cả corePool bận — hấp thụ spike
        executor.setQueueCapacity(100);

        // Thread idle > 60s sẽ bị dừng (scale-down khi load giảm)
        executor.setKeepAliveSeconds(60);
        executor.setAllowCoreThreadTimeOut(false); // core thread không timeout — luôn sẵn sàng

        executor.setThreadNamePrefix("auth-async-");

        // CallerRunsPolicy: nếu cả pool + queue đều đầy, thread gọi tự xử lý
        // → Không bao giờ reject request, chỉ slow down caller
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());

        // Chờ task đang chạy hoàn thành khi shutdown (tránh mất dữ liệu)
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(30);

        executor.initialize();
        return executor;
    }
}
