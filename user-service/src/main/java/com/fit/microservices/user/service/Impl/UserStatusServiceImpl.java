package com.fit.microservices.user.service.Impl;

import com.fit.microservices.user.service.UserStatusService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
@RequiredArgsConstructor
public class UserStatusServiceImpl implements UserStatusService {
    private final StringRedisTemplate stringRedisTemplate;
    private static final String REDIS_KEY_PREFIX = "user:online:";

    @Override
    public void setUserOnline(Long userId) {
        String key = REDIS_KEY_PREFIX + userId;
        stringRedisTemplate.opsForValue().increment(key);
        stringRedisTemplate.expire(key, Duration.ofDays(1));
    }

    @Override
    public void setUserOffline(Long userId) {
        String key = REDIS_KEY_PREFIX + userId;
        String countStr = stringRedisTemplate.opsForValue().get(key);

        if (countStr != null) {
            long count = Long.parseLong(countStr);
            if (count > 1) {
                stringRedisTemplate.opsForValue().decrement(key);
            } else {
                stringRedisTemplate.delete(key);
            }
        }
    }

    @Override
    public boolean isUserOnline(Long userId) {
        return Boolean.TRUE.equals(stringRedisTemplate.hasKey(REDIS_KEY_PREFIX + userId));
    }
    public void forceUserOffline(Long userId) {
        stringRedisTemplate.delete(REDIS_KEY_PREFIX + userId);
    }
}