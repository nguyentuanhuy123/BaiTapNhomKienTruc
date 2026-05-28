package com.fit.microservices.auth.outbox;

public enum OutboxStatus {
    PENDING,
    PUBLISHED,
    FAILED
}
