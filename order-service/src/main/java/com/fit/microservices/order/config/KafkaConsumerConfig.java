package com.fit.microservices.order.config;


import com.fit.microservices.order.event.InventoryFailedEvent;
import com.fit.microservices.order.event.PaymentCompletedEvent;
import com.fit.microservices.order.event.PaymentFailedEvent;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory;
import org.springframework.kafka.core.ConsumerFactory;
import org.springframework.kafka.core.DefaultKafkaConsumerFactory;
import org.springframework.kafka.support.serializer.JsonDeserializer;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class KafkaConsumerConfig {
    @Value("${spring.kafka.bootstrap-servers}")
    private String boostrapServers;

    private Map<String ,Object> baseProps(String groupId){
        Map<String ,Object> props = new HashMap<>();
        props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, boostrapServers);
        props.put(ConsumerConfig.GROUP_ID_CONFIG, groupId);
        props.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");
        props.put(JsonDeserializer.TRUSTED_PACKAGES, "*");
        return props;
    }

    // PaymentCompletedEvent
    @Bean
    public ConsumerFactory<String, PaymentCompletedEvent> paymentCompletedConsumerFactory(){
        return new DefaultKafkaConsumerFactory<>(
                baseProps("order-service-payment-completed"),
                new StringDeserializer(),
                new JsonDeserializer<>(PaymentCompletedEvent.class)
        );
    }
    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, PaymentCompletedEvent> paymentCompletedKafkaListenerContainerFactory(){
        ConcurrentKafkaListenerContainerFactory<String, PaymentCompletedEvent> factory = new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(paymentCompletedConsumerFactory());
        return factory;
    }
    @Bean
    public ConsumerFactory<String, PaymentFailedEvent> paymentFailedConsumerFactory(){
        return new DefaultKafkaConsumerFactory<>(
                baseProps("order-service-payment-failed"),
                new StringDeserializer(),
                new JsonDeserializer<>(PaymentFailedEvent.class)
        );
    }
    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, PaymentFailedEvent> paymentFailedKafkaListenerContainerFactory(){
        ConcurrentKafkaListenerContainerFactory<String, PaymentFailedEvent> factory = new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(paymentFailedConsumerFactory());
        return factory;
    }

    @Bean
    public ConsumerFactory<String, InventoryFailedEvent>  inventoryFailedConsumerFactory(){
        return new DefaultKafkaConsumerFactory<>(
                baseProps("order-service-inventory-failed"),
                new StringDeserializer(),
                new JsonDeserializer<>(InventoryFailedEvent.class)
        );
    }

    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, InventoryFailedEvent> inventoryFailedKafkaListenerContainerFactory(){
        ConcurrentKafkaListenerContainerFactory<String, InventoryFailedEvent> factory = new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(inventoryFailedConsumerFactory());
        return factory;
    }



}
