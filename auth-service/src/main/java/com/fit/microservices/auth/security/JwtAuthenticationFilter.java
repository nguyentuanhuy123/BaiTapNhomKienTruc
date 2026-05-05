package com.fit.microservices.auth.security;

import com.fit.microservices.auth.repository.AuthSessionRepository;
import com.fit.microservices.auth.util.JwtUtil;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final AuthSessionRepository authSessionRepository;

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

        // ❌ validate JWT signature + expiry
        if (!jwtUtil.isTokenValid(token)) {
            filterChain.doFilter(request, response);
            return;
        }

        // ❌ chỉ cho access token đi qua
        if (!jwtUtil.isAccessToken(token)) {
            filterChain.doFilter(request, response);
            return;
        }

        Claims claims = jwtUtil.extractClaims(token);

        String email = claims.getSubject();
        String role = claims.get("role", String.class);
        String sessionIdStr = claims.get("sessionId", String.class);

        // 🔥 CHECK SESSION LIVE (QUAN TRỌNG)
        if (sessionIdStr != null) {
            UUID sessionId = UUID.fromString(sessionIdStr);

            boolean sessionValid = authSessionRepository
                    .findById(sessionId)
                    .map(s -> !s.isRevoked() && s.getExpiresAt().isAfter(java.time.LocalDateTime.now()))
                    .orElse(false);

            if (!sessionValid) {
                filterChain.doFilter(request, response);
                return;
            }
        }

        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(
                        email,
                        null,
                        List.of(() -> role)
                );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        filterChain.doFilter(request, response);
    }
}