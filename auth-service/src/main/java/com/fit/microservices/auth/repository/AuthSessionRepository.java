package com.fit.microservices.auth.repository;

import com.fit.microservices.auth.model.AuthSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface AuthSessionRepository extends JpaRepository<AuthSession, UUID> {
    Optional<AuthSession> findByRefreshTokenHash(String refreshTokenHash);
    Optional<AuthSession> findByIdAndRevokedFalse(UUID id);
    @Modifying
    @Query("update AuthSession s set s.revoked = true where s.userId = :userId and s.revoked = false")
    int revokeAllByUserId(@Param("userId") Long userId);
}