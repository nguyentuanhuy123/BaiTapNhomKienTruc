package com.fit.microservices.user.service.Impl;

import com.fit.microservices.user.dto.UserRequest;
import com.fit.microservices.user.dto.UserResponse;
import com.fit.microservices.user.model.User;
import com.fit.microservices.user.repository.UserRepository;
import com.fit.microservices.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;

    @Override
    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id).orElseThrow(()->new RuntimeException("User not found"));
        return new UserResponse(user.getId());
    }
}
