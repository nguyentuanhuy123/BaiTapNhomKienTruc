package com.fit.microservices.user.service;

public interface UserStatusService {
    Long setUserOnline(Long userId);
    Long setUserOffline(Long userId);
    boolean isUserOnline(Long userId);
    void forceUserOffline(Long userId);
}
