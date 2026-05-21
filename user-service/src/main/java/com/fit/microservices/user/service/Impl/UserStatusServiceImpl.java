package com.fit.microservices.user.service.Impl;

import com.fit.microservices.user.service.UserStatusService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
@RequiredArgsConstructor
public class UserStatusServiceImpl implements UserStatusService {
    private final StringRedisTemplate stringRedisTemplate;
    private static final String REDIS_KEY_PREFIX = "user:online:";

    @Override
    public Long setUserOnline(Long userId) {
        String key = REDIS_KEY_PREFIX + userId;
        // increment trả về giá trị mới sau khi cộng
        Long count = stringRedisTemplate.opsForValue().increment(key);
        stringRedisTemplate.expire(key, Duration.ofDays(1));
        return count;
    }

    @Override
    public Long setUserOffline(Long userId) {
        String key = REDIS_KEY_PREFIX + userId;
        // decrement trả về giá trị mới sau khi trừ
        Long count = stringRedisTemplate.opsForValue().decrement(key);

        if (count != null && count <= 0) {
            stringRedisTemplate.delete(key);
            return 0L;
        }
        return count;
    }

    @Override
    public boolean isUserOnline(Long userId) {
        String countStr = stringRedisTemplate.opsForValue().get(REDIS_KEY_PREFIX + userId);
        return countStr != null && Long.parseLong(countStr) > 0;
    }
    public void forceUserOffline(Long userId) {
        stringRedisTemplate.delete(REDIS_KEY_PREFIX + userId);
    }
}