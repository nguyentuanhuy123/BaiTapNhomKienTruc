package com.fit.microservices.auth.util;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Map;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.access-expiration}")
    private long accessExpiration;

    @Value("${jwt.refresh-expiration}")
    private long refreshExpiration;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    // ================= ACCESS TOKEN =================
    public String generateAccessToken(String email, Map<String, Object> claims) {
        return Jwts.builder()
                .setSubject(email)
                .addClaims(claims)
                .claim("tokenType", "access") // 🔥 phân biệt loại token
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + accessExpiration))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // ================= REFRESH TOKEN =================
    public String generateRefreshToken(String email, String sessionId) {
        return Jwts.builder()
                .setSubject(email)
                .claim("tokenType", "refresh") // 🔥 bắt buộc
                .claim("sessionId", sessionId) // 🔥 liên kết session
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + refreshExpiration))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // ================= EXTRACT =================
    public Claims extractClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public String extractEmail(String token) {
        return extractClaims(token).getSubject();
    }

    public String extractSessionId(String token) {
        return extractClaims(token).get("sessionId", String.class);
    }

    public String extractTokenType(String token) {
        return extractClaims(token).get("tokenType", String.class);
    }

    // ================= VALIDATION =================
    public boolean isTokenValid(String token) {
        try {
            extractClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public boolean isAccessToken(String token) {
        try {
            return "access".equals(extractTokenType(token));
        } catch (Exception e) {
            return false;
        }
    }

    public boolean isRefreshToken(String token) {
        try {
            return "refresh".equals(extractTokenType(token));
        } catch (Exception e) {
            return false;
        }
    }
    // ================= RESET TOKEN =================
    public String generateResetToken(String email) {
        return Jwts.builder()
                .setSubject(email)
                .claim("tokenType", "reset") // Phân biệt loại token
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 15 * 60 * 1000)) // Hết hạn sau 15 phút
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public boolean isResetToken(String token) {
        try {
            return "reset".equals(extractTokenType(token));
        } catch (Exception e) {
            return false;
        }
    }
}