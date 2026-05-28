package com.fit.microservices.notification.config;

import com.fit.microservices.notification.event.OrderCancelledEvent;
import com.fit.microservices.notification.event.OrderCompletedEvent;
import com.fit.microservices.notification.event.OrderPlacedEvent;
import com.fit.microservices.notification.event.PaymentCompletedEvent;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory;
import org.springframework.kafka.core.ConsumerFactory;
import org.springframework.kafka.core.DefaultKafkaConsumerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.listener.DeadLetterPublishingRecoverer;
import org.springframework.kafka.listener.DefaultErrorHandler;
import org.springframework.kafka.support.converter.JsonMessageConverter;
import org.springframework.kafka.support.converter.RecordMessageConverter;
import org.springframework.kafka.support.serializer.JsonDeserializer;
import org.springframework.util.backoff.FixedBackOff;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class KafkaConsumerConfig {

    @Value("${spring.kafka.bootstrap-servers}")
    private String bootstrapServers;

    @Value("${spring.kafka.consumer.group-id}")
    private String groupId;

    // ── Error Handler (dùng chung cho tất cả factory) ──────────────────

    @Bean
    public DefaultErrorHandler errorHandler(KafkaTemplate<String, Object> kafkaTemplate) {
        DeadLetterPublishingRecoverer recoverer =
                new DeadLetterPublishingRecoverer(kafkaTemplate);
        FixedBackOff backOff = new FixedBackOff(2_000L, 3L);
        DefaultErrorHandler handler = new DefaultErrorHandler(recoverer, backOff);
        handler.addNotRetryableExceptions(
                org.springframework.kafka.support.serializer.DeserializationException.class
        );
        return handler;
    }

    // ── Base consumer config ────────────────────────────────────────────

    private Map<String, Object> baseConsumerProps() {
        Map<String, Object> props = new HashMap<>();
        props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        props.put(ConsumerConfig.GROUP_ID_CONFIG, groupId);
        props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
        props.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, JsonDeserializer.class);
        props.put(JsonDeserializer.TRUSTED_PACKAGES, "com.fit.microservices.*");
        return props;
    }

    // ── OrderPlacedEvent ────────────────────────────────────────────────

    @Bean
    public ConsumerFactory<String, OrderPlacedEvent> orderPlacedEventConsumerFactory() {
        return new DefaultKafkaConsumerFactory<>(
                baseConsumerProps(),
                new StringDeserializer(),
                new JsonDeserializer<>(OrderPlacedEvent.class, false));
    }

    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, OrderPlacedEvent>
    orderPlacedEventListenerFactory(DefaultErrorHandler errorHandler) {
        ConcurrentKafkaListenerContainerFactory<String, OrderPlacedEvent> factory =
                new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(orderPlacedEventConsumerFactory());
        factory.setCommonErrorHandler(errorHandler);
        return factory;
    }

    // ── OrderCompletedEvent ─────────────────────────────────────────────

    @Bean
    public ConsumerFactory<String, OrderCompletedEvent> orderCompletedEventConsumerFactory() {
        return new DefaultKafkaConsumerFactory<>(
                baseConsumerProps(),
                new StringDeserializer(),
                new JsonDeserializer<>(OrderCompletedEvent.class, false));
    }

    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, OrderCompletedEvent>
    orderCompletedEventListenerFactory(DefaultErrorHandler errorHandler) {
        ConcurrentKafkaListenerContainerFactory<String, OrderCompletedEvent> factory =
                new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(orderCompletedEventConsumerFactory());
        factory.setCommonErrorHandler(errorHandler);
        return factory;
    }

    // ── OrderCancelledEvent ─────────────────────────────────────────────

    @Bean
    public ConsumerFactory<String, OrderCancelledEvent> orderCancelledEventConsumerFactory() {
        return new DefaultKafkaConsumerFactory<>(
                baseConsumerProps(),
                new StringDeserializer(),
                new JsonDeserializer<>(OrderCancelledEvent.class, false));
    }

    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, OrderCancelledEvent>
    orderCancelledEventListenerFactory(DefaultErrorHandler errorHandler) {
        ConcurrentKafkaListenerContainerFactory<String, OrderCancelledEvent> factory =
                new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(orderCancelledEventConsumerFactory());
        factory.setCommonErrorHandler(errorHandler);
        return factory;
    }

    // ── PaymentCompletedEvent (MỚI) ─────────────────────────────────────

    @Bean
    public ConsumerFactory<String, PaymentCompletedEvent> paymentCompletedEventConsumerFactory() {
        return new DefaultKafkaConsumerFactory<>(
                baseConsumerProps(),
                new StringDeserializer(),
                new JsonDeserializer<>(PaymentCompletedEvent.class, false));
    }

    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, PaymentCompletedEvent>
    paymentCompletedEventListenerFactory(DefaultErrorHandler errorHandler) {
        ConcurrentKafkaListenerContainerFactory<String, PaymentCompletedEvent> factory =
                new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(paymentCompletedEventConsumerFactory());
        factory.setCommonErrorHandler(errorHandler);
        return factory;
    }

    // ── Default factory (AuthEventListener, UserEventListener) ──────────

    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, Object>
    kafkaListenerContainerFactory(DefaultErrorHandler errorHandler) {
        ConcurrentKafkaListenerContainerFactory<String, Object> factory =
                new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(new DefaultKafkaConsumerFactory<>(baseConsumerProps()));
        factory.setCommonErrorHandler(errorHandler);
        factory.setRecordMessageConverter(converter());
        return factory;
    }

    @Bean
    public RecordMessageConverter converter() {
        return new JsonMessageConverter();
    }
}
