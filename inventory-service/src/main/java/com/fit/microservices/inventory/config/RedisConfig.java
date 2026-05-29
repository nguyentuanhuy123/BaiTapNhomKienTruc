package com.fit.microservices.inventory.config;

import com.fit.microservices.inventory.listener.FlashSaleStockListener;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.listener.ChannelTopic;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;
import org.springframework.data.redis.listener.adapter.MessageListenerAdapter;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;

@Configuration
public class RedisConfig {

    @Bean
    public RedisSerializer<Object> redisSerializer() {
        return new GenericJackson2JsonRedisSerializer();
    }

    @Bean
    public MessageListenerAdapter listenerAdapter(FlashSaleStockListener listener) {
        MessageListenerAdapter adapter = new MessageListenerAdapter(listener, "handleMessage");
        adapter.setSerializer(redisSerializer());
        return adapter;
    }

    @Bean
    public RedisMessageListenerContainer redisContainer(
            RedisConnectionFactory connectionFactory,
            MessageListenerAdapter listenerAdapter) {
        RedisMessageListenerContainer container = new RedisMessageListenerContainer();
        container.setConnectionFactory(connectionFactory);
        
        // Subscribe to both deduct and reclaim channels
        container.addMessageListener(listenerAdapter, new ChannelTopic("inventory-deduct-channel"));
        container.addMessageListener(listenerAdapter, new ChannelTopic("inventory-reclaim-channel"));
        
        return container;
    }
}
