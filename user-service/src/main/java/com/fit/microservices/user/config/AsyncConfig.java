package com.fit.microservices.user.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;
import java.util.concurrent.ThreadPoolExecutor;

/**
 * Cấu hình Thread Pool cho tác vụ @Async trong user-service.
 *
 * Scale tự động:
 *  - Ít request  → chỉ dùng corePoolSize thread (10), thread idle tự giải phóng
 *  - Nhiều request → queue hấp thụ burst, rồi scale lên maxPoolSize (50)
 *  - Shutdown → chờ tối đa 30s cho task hoàn thành (tránh mất dữ liệu)
 *
 * Dùng cho:
 *  - Upload ảnh S3 (@Async nếu áp dụng)
 *  - Gửi OTP qua Kafka
 *  - Các tác vụ nền khác
 */
@Configuration
@EnableAsync
public class AsyncConfig {

    @Bean(name = "taskExecutor")
    public Executor taskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();

        executor.setCorePoolSize(10);
        executor.setMaxPoolSize(50);
        executor.setQueueCapacity(100);
        executor.setKeepAliveSeconds(60);
        executor.setAllowCoreThreadTimeOut(false);

        executor.setThreadNamePrefix("user-async-");

        // Không bao giờ reject — caller tự xử lý khi pool + queue đầy
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());

        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(30);

        executor.initialize();
        return executor;
    }
}
