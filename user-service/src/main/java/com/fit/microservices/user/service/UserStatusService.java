package com.fit.microservices.user.service;

public interface UserStatusService {
    void setUserOnline(Long userId);
    void setUserOffline(Long userId);
    boolean isUserOnline(Long userId);
    void forceUserOffline(Long userId);
}
