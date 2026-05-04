package com.fit.microservices.user.service;

import com.fit.microservices.user.dto.UserRequest;
import com.fit.microservices.user.dto.UserResponse;
import com.fit.microservices.user.model.User;
import com.fit.microservices.user.repository.UserRepository;

import java.util.List;
import java.util.Optional;

public interface UserService {
    UserResponse getUserById(Long id);

}
