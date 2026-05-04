//package com.fit.microservices.gateway.filter;
//
//import io.jsonwebtoken.Claims;
//import io.jsonwebtoken.Jwts;
//import io.jsonwebtoken.security.Keys;
//import org.springframework.http.HttpHeaders;
//import org.springframework.cloud.gateway.filter.GatewayFilterChain;
//import org.springframework.cloud.gateway.filter.GlobalFilter;
//import org.springframework.http.HttpStatus;
//import org.springframework.http.server.reactive.ServerHttpRequest;
//import org.springframework.stereotype.Component;
//import org.springframework.web.server.ServerWebExchange;
//import reactor.core.publisher.Mono;
//
//import java.security.Key;
//
//@Component
//public class JwtAuthFilter implements GlobalFilter {
//
//    private final String SECRET_KEY = "MY_SECRET_KEY_123456789012345678901234567890";
//
//    private Key getSigningKey() {
//        return Keys.hmacShaKeyFor(SECRET_KEY.getBytes());
//    }
//
//    @Override
//    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
//
//        String path = exchange.getRequest().getURI().getPath();
//
//        // Cho phép login, register
//        if (path.startsWith("/api/auth")) {
//            return chain.filter(exchange);
//        }
//        if (path.startsWith("/actuator/prometheus")) {
//            return chain.filter(exchange);
//        }
//        if (path.startsWith("/actuator/**")) {
//            return chain.filter(exchange);
//        }
//
//        String authHeader = exchange.getRequest()
//                .getHeaders()
//                .getFirst(HttpHeaders.AUTHORIZATION);
//
//        // Không có token → CHẶN
//        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
//            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
//            return exchange.getResponse().setComplete();
//        }
//
//        String token = authHeader.substring(7);
//
//        Claims claims = Jwts.parserBuilder()
//                .setSigningKey(getSigningKey())
//                .build()
//                .parseClaimsJws(token)
//                .getBody();
//        ServerHttpRequest request = exchange.getRequest()
//                .mutate()
//                .header("X-User-Email", claims.getSubject())
//                .header("X-User-Role", claims.get("role").toString())
//                .build();
//
//        return chain.filter(exchange.mutate().request(request).build());
//    }
//}
//
//
