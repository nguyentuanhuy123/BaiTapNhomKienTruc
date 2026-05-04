package com.fit.microservices.auth.service;

import com.fit.microservices.auth.dto.LoginRequest;
import com.fit.microservices.auth.dto.LoginResponse;
import com.fit.microservices.auth.dto.RegisterRequest;
import com.fit.microservices.auth.dto.RegisterResponse;
import org.springframework.http.ResponseEntity;

import java.util.Map;

public interface AuthService {
    LoginResponse login(LoginRequest loginRequest);
    void register(RegisterRequest registerRequest);
}
