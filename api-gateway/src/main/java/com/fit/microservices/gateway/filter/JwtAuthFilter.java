package com.fit.microservices.gateway.filter;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.List;

/**
 * GlobalFilter chạy trước mọi route.
 *
 * Trách nhiệm:
 *  1. Bỏ qua (pass-through) các public path không cần JWT.
 *  2. Từ chối request thiếu/sai/hết hạn token với HTTP 401.
 *  3. Chặn refresh-token / reset-token bị dùng nhầm thay access-token.
 *  4. Forward X-User-Id, X-User-Email, X-User-Role xuống downstream
 *     để các service không cần parse lại JWT và rate-limiter hoạt động per-user.
 *
 * Order = -1: chạy TRƯỚC RequestRateLimiter (order = 1 mặc định),
 * đảm bảo X-User-Id đã có trong header khi userKeyResolver đọc.
 */
@Component
public class JwtAuthFilter implements GlobalFilter, Ordered {

    @Value("${jwt.secret}")
    private String secret;

    // Các prefix luôn được bỏ qua, không cần Bearer token
    private static final List<String> PUBLIC_PREFIXES = List.of(
            "/api/auth/",       // login, register, refresh, ...
            "/actuator/",       // prometheus, health
            "/eureka/",         // discovery server UI
            "/ws/"              // WebSocket — handshake chỉ xảy ra 1 lần
    );

    // GET requests tới các prefix này là public (browse sản phẩm, danh mục, ...)
    private static final List<String> PUBLIC_GET_PREFIXES = List.of(
            "/api/product",
            "/api/category",
            "/api/comment",
            "/api/wishlist"
    );

    @Override
    public int getOrder() {
        return -1;
    }

    private Key signingKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {

        String path   = exchange.getRequest().getURI().getPath();
        String method = exchange.getRequest().getMethod().name();

        // ── 1. Public paths — không cần token ─────────────────────────────────
        if (isPublic(path) || ("GET".equalsIgnoreCase(method) && isPublicGet(path))) {
            return chain.filter(exchange);
        }

        // ── 2. Kiểm tra Authorization header ──────────────────────────────────
        String authHeader = exchange.getRequest()
                .getHeaders()
                .getFirst(HttpHeaders.AUTHORIZATION);

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return deny(exchange, "MISSING_TOKEN", "Authorization header is required");
        }

        String token = authHeader.substring(7);

        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(signingKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();

            // ── 3. Chỉ chấp nhận access token ─────────────────────────────────
            String tokenType = claims.get("tokenType", String.class);
            if (!"access".equals(tokenType)) {
                return deny(exchange, "WRONG_TOKEN_TYPE",
                        "Only access tokens are accepted here");
            }

            // ── 4. Lấy thông tin user từ claims ───────────────────────────────
            // userId có thể là Integer hoặc Long tuỳ jjwt deserialize
            Object userIdObj = claims.get("userId");
            String userId  = userIdObj != null ? userIdObj.toString() : "";
            String email   = claims.getSubject() != null ? claims.getSubject() : "";
            String role    = claims.get("role", String.class);
            role = (role != null) ? role : "";

            // ── 5. Forward headers xuống downstream ───────────────────────────
            // Các service (product, order...) đọc từ đây thay vì parse lại JWT.
            // RateLimiterConfig.userKeyResolver() đọc X-User-Id để limit per-user.
            ServerHttpRequest mutated = exchange.getRequest().mutate()
                    .header("X-User-Id",    userId)
                    .header("X-User-Email", email)
                    .header("X-User-Role",  role)
                    .build();

            return chain.filter(exchange.mutate().request(mutated).build());

        } catch (ExpiredJwtException e) {
            return deny(exchange, "TOKEN_EXPIRED", "JWT token has expired");
        } catch (JwtException | IllegalArgumentException e) {
            return deny(exchange, "INVALID_TOKEN", "Invalid JWT token");
        }
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private boolean isPublic(String path) {
        return PUBLIC_PREFIXES.stream().anyMatch(path::startsWith);
    }

    private boolean isPublicGet(String path) {
        return PUBLIC_GET_PREFIXES.stream().anyMatch(path::startsWith);
    }

    private Mono<Void> deny(ServerWebExchange exchange, String error, String message) {
        ServerHttpResponse res = exchange.getResponse();
        res.setStatusCode(HttpStatus.UNAUTHORIZED);
        res.getHeaders().setContentType(MediaType.APPLICATION_JSON);
        String body = String.format(
                "{\"error\":\"%s\",\"message\":\"%s\"}", error, message);
        return res.writeWith(Mono.just(
                res.bufferFactory().wrap(body.getBytes(StandardCharsets.UTF_8))));
    }
}