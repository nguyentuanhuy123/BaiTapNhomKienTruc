package com.fit.microservices.user.outbox;

public enum OutboxStatus {
    PENDING,
    PUBLISHED,
    FAILED
}
