package com.fit.microservices.notification.config;

import com.fit.microservices.notification.event.OrderCancelledEvent;
import com.fit.microservices.notification.event.OrderCompletedEvent;
import com.fit.microservices.notification.event.OrderPlacedEvent;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory;
import org.springframework.kafka.core.ConsumerFactory;
import org.springframework.kafka.core.DefaultKafkaConsumerFactory;
import org.springframework.kafka.support.converter.JsonMessageConverter;
import org.springframework.kafka.support.converter.RecordMessageConverter;
import org.springframework.kafka.support.serializer.JsonDeserializer;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class KafkaConsumerConfig {

    // ✅ FIX: Inject từ application.properties thay vì hardcode "localhost:9092"
    @Value("${spring.kafka.bootstrap-servers}")
    private String bootstrapServers;

    // ✅ FIX: Dùng chung một group-id lấy từ properties
    @Value("${spring.kafka.consumer.group-id}")
    private String groupId;

    // --- Helper tạo base config để tránh lặp code ---
    private Map<String, Object> baseConsumerProps() {
        Map<String, Object> props = new HashMap<>();
        props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers); // ✅ không hardcode
        props.put(ConsumerConfig.GROUP_ID_CONFIG, groupId);                   // ✅ nhất quán
        props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
        props.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, JsonDeserializer.class);
        props.put(JsonDeserializer.TRUSTED_PACKAGES, "com.fit.microservices.*");
        return props;
    }

    // --- OrderPlacedEvent ---
    @Bean
    public ConsumerFactory<String, OrderPlacedEvent> orderPlacedEventConsumerFactory() {
        return new DefaultKafkaConsumerFactory<>(
                baseConsumerProps(),
                new StringDeserializer(),
                new JsonDeserializer<>(OrderPlacedEvent.class, false)
        );
    }

    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, OrderPlacedEvent> orderPlacedEventListenerFactory() {
        ConcurrentKafkaListenerContainerFactory<String, OrderPlacedEvent> factory =
                new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(orderPlacedEventConsumerFactory());
        return factory;
    }

    // --- OrderCompletedEvent ---
    @Bean
    public ConsumerFactory<String, OrderCompletedEvent> orderCompletedEventConsumerFactory() {
        return new DefaultKafkaConsumerFactory<>(
                baseConsumerProps(),
                new StringDeserializer(),
                new JsonDeserializer<>(OrderCompletedEvent.class, false)
        );
    }

    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, OrderCompletedEvent> orderCompletedEventListenerFactory() {
        ConcurrentKafkaListenerContainerFactory<String, OrderCompletedEvent> factory =
                new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(orderCompletedEventConsumerFactory());
        return factory;
    }

    // --- OrderCancelledEvent ---
    @Bean
    public ConsumerFactory<String, OrderCancelledEvent> orderCancelledEventConsumerFactory() {
        // ✅ FIX: Dùng cùng groupId thay vì "notification-cancel-group" riêng lẻ
        Map<String, Object> props = baseConsumerProps();
        return new DefaultKafkaConsumerFactory<>(
                props,
                new StringDeserializer(),
                new JsonDeserializer<>(OrderCancelledEvent.class, false)
        );
    }

    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, OrderCancelledEvent> orderCancelledEventListenerFactory() {
        ConcurrentKafkaListenerContainerFactory<String, OrderCancelledEvent> factory =
                new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(orderCancelledEventConsumerFactory());
        return factory;
    }
    @Bean
    public RecordMessageConverter converter() {
        // This tells Spring: "If a listener method needs an Object (Map, DTO),
        // and the record value is a JSON string, use Jackson to convert it."
        return new JsonMessageConverter();
    }
}