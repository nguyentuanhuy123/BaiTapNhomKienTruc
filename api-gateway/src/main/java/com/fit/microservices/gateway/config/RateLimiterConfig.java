package com.fit.microservices.gateway.config;

import org.springframework.cloud.gateway.filter.ratelimit.KeyResolver;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import reactor.core.publisher.Mono;

import java.util.Optional;

@Configuration
public class RateLimiterConfig {

    @Bean
    @Primary
    public KeyResolver userKeyResolver() {
        // Rate limit by client remote IP address
        return exchange -> Mono.just(
                Optional.ofNullable(exchange.getRequest().getRemoteAddress())
                        .map(address -> address.getAddress().getHostAddress())
                        .orElse("127.0.0.1")
        );
    }
}
