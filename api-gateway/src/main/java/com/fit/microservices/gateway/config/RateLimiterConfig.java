package com.fit.microservices.gateway.config;

import org.springframework.cloud.gateway.filter.ratelimit.KeyResolver;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import reactor.core.publisher.Mono;

import java.util.Optional;

/**
 * Rate Limiter Key Resolvers
 *
 * userKeyResolver  (@Primary, global default-filter)
 *   → Lấy userId từ header X-User-Id (được inject bởi JwtAuthFilter).
 *   → Nếu chưa xác thực (không có header), fallback về "ip:<địa chỉ IP>".
 *   Ưu điểm: người dùng đăng nhập sau NAT / proxy vẫn bị limit đúng per-user,
 *   không bị "oan" vì chung IP với người khác.
 *
 * ipKeyResolver  (dùng cho route /api/auth/**)
 *   → Luôn dùng IP, phù hợp cho brute-force protection ở endpoint login/register.
 *   → Giới hạn chặt hơn (5 req/s) được cấu hình trong application.properties.
 */
@Configuration
public class RateLimiterConfig {

    /**
     * Primary resolver – dùng cho tất cả route thông thường (qua default-filter).
     * Ưu tiên X-User-Id (JWT claim được gateway forward), fallback về IP.
     */
    @Bean
    @Primary
    public KeyResolver userKeyResolver() {
        return exchange -> {
            String userId = exchange.getRequest().getHeaders().getFirst("X-User-Id");
            if (userId != null && !userId.isBlank()) {
                return Mono.just("user:" + userId);
            }
            // Fallback về IP khi chưa xác thực
            return Mono.just("ip:" + resolveIp(exchange));
        };
    }

    /**
     * IP-only resolver – gán cho route /api/auth/** để chặn brute-force.
     * Dùng riêng biệt với userKeyResolver để bucket Redis không bị dùng chung.
     */
    @Bean
    public KeyResolver ipKeyResolver() {
        return exchange -> Mono.just("auth-ip:" + resolveIp(exchange));
    }

    // ─── Helper ──────────────────────────────────────────────────────────────────

    private String resolveIp(org.springframework.web.server.ServerWebExchange exchange) {
        // Ưu tiên header X-Forwarded-For (khi có reverse proxy / load balancer phía trước)
        String forwarded = exchange.getRequest().getHeaders().getFirst("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            // X-Forwarded-For có thể chứa nhiều IP cách nhau bằng dấu phẩy; lấy IP đầu tiên
            return forwarded.split(",")[0].trim();
        }
        return Optional.ofNullable(exchange.getRequest().getRemoteAddress())
                .map(addr -> addr.getAddress().getHostAddress())
                .orElse("unknown");
    }
}
