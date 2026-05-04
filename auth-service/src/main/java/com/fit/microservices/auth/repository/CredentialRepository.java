package com.fit.microservices.auth.repository;

import com.fit.microservices.auth.model.Credential;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CredentialRepository extends JpaRepository<Credential, Long> {
    Optional<Credential> findByEmail(String email);
}
