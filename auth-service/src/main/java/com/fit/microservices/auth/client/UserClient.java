package com.fit.microservices.auth.client;

import com.fit.microservices.auth.dto.UserRequest;
import com.fit.microservices.auth.dto.UserResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name="user-service",path = "/api/user" )
public interface UserClient {
    @PostMapping
   UserResponse createUser(@RequestBody UserRequest user);
}
