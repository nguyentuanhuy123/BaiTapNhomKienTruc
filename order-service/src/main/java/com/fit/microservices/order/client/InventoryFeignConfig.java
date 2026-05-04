package com.fit.microservices.order.client;

import com.fit.microservices.order.exception.InventoryServiceUnavailableException;
import feign.Response;
import feign.codec.ErrorDecoder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class InventoryFeignConfig {
    @Bean
    public ErrorDecoder errorDecoder() {
        return new ErrorDecoder() {
            private final ErrorDecoder defaultDecoder = new Default();

            @Override
            public Exception decode(String methodKey, Response response) {
                if(response.status() == 503){
                    return new InventoryServiceUnavailableException("Inventory service is unavailable");
                }
                return defaultDecoder.decode(methodKey, response);
            }
        };
    }
}
