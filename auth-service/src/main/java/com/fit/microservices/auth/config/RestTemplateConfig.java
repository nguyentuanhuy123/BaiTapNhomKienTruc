package com.fit.microservices.auth.config;

import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;

/**
 * Cung cấp RestTemplate như một Spring Bean để được tái sử dụng (connection pool)
 * thay vì tạo new RestTemplate() mỗi lần — tránh tốn chi phí mở TCP mới mỗi request.
 *
 * connectTimeout: 3s — thời gian tối đa chờ kết nối tới Google API
 * readTimeout:    5s — thời gian tối đa chờ response từ Google API
 */
@Configuration
public class RestTemplateConfig {

    @Bean
    public RestTemplate restTemplate(RestTemplateBuilder builder) {
        return builder
                .connectTimeout(Duration.ofSeconds(3))
                .readTimeout(Duration.ofSeconds(5))
                .build();
    }
}
