package com.fit.microservices.auth.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fit.microservices.auth.model.AuthSession;
import com.fit.microservices.auth.util.JwtUtil;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final RedisTemplate<String, Object> redisTemplate;
    private final ObjectMapper objectMapper;

    private static final String SESSION_KEY_PREFIX = "session:";

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);

        if (!jwtUtil.isTokenValid(token) || !jwtUtil.isAccessToken(token)) {
            filterChain.doFilter(request, response);
            return;
        }

        Claims claims = jwtUtil.extractClaims(token);

        String email = claims.getSubject();
        String role = claims.get("role", String.class);
        String sessionId = claims.get("sessionId", String.class);

        // FORCE LOGOUT CHECK
        if (sessionId != null) {

            Object raw = redisTemplate.opsForValue()
                    .get(SESSION_KEY_PREFIX + sessionId);

            if (raw == null) {
                sendError(response, "SESSION_REVOKED");
                return;
            }

            AuthSession session;

            if (raw instanceof AuthSession authSession) {
                session = authSession;
            } else {
                session = objectMapper.convertValue(raw, AuthSession.class);
            }

            if (session.isRevoked()) {
                sendError(response, "SESSION_REVOKED");
                return;
            }
        }

        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(
                        email,
                        null,
                        List.of(() -> role)
                );

        SecurityContextHolder.getContext()
                .setAuthentication(authentication);

        filterChain.doFilter(request, response);
    }

    private void sendError(HttpServletResponse response, String message)
            throws IOException {

        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);

        response.setContentType("application/json;charset=UTF-8");

        response.getWriter()
                .write("{\"error\":\"" + message + "\"}");
    }
}