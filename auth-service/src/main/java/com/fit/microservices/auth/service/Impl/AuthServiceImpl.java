package com.fit.microservices.auth.service.Impl;

import com.fit.microservices.auth.client.UserClient;
import com.fit.microservices.auth.dto.*;
import com.fit.microservices.auth.model.Credential;
import com.fit.microservices.auth.repository.CredentialRepository;
import com.fit.microservices.auth.service.AuthService;
import com.fit.microservices.auth.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {
    private final CredentialRepository credentialRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final UserClient userClient;
//    @Override
//    public ResponseEntity<?> login(LoginRequest loginRequest) {
//        Credential credential = credentialRepository.findByEmail(loginRequest.getEmail())
//                .orElseThrow(() -> new RuntimeException("Invalid credentials"));
//
//        if (!passwordEncoder.matches(loginRequest.getPassword(), credential.getPassword())) {
//            throw new RuntimeException("Invalid credentials");
//        }
//        String token = jwtUtil.generateToken(loginRequest.getEmail(), credential.getRole());
//        return ResponseEntity.ok(
//                new LoginResponse(
//                        token,
//                        credential.getRole()
//                )
//        );
//
//    }
    @Override
    public LoginResponse login(LoginRequest request) {
        Credential credential = credentialRepository
                .findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.UNAUTHORIZED,
                                "Invalid credentials"
                        )
                );

        if (!passwordEncoder.matches(request.getPassword(),credential.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        String token = jwtUtil.generateToken(
                credential.getEmail(),
                Map.of(
                        "userId",credential.getUserId()
                        ,"role", credential.getRole())
        );


        return new LoginResponse(token, credential.getRole());
    }


    @Override
    public void register(RegisterRequest registerRequest) {
        UserRequest  userRequest = new UserRequest();
        userRequest.setFullName(registerRequest.getFullName());
        userRequest.setEmail(registerRequest.getEmail());
        userRequest.setPhone(registerRequest.getPhone());
        userRequest.setAddress(registerRequest.getAddress());
        UserResponse userResponse = userClient.createUser(userRequest);
        Credential  credential = new Credential();
        credential.setEmail(registerRequest.getEmail());
        credential.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        credential.setUserId(userResponse.getId());
        credential.setRole("USER");
        credentialRepository.save(credential);
    }
}
