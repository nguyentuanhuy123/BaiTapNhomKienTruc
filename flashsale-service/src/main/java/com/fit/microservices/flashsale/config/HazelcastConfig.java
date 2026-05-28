package com.fit.microservices.flashsale.config;

import com.hazelcast.config.Config;
import com.hazelcast.config.MapConfig;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class HazelcastConfig {

    @Bean
    public Config hazelcastInstanceConfig() {
        Config config = new Config();
        config.setClusterName("flashsale-cluster");

        // Network Configuration
        config.getNetworkConfig().getJoin().getMulticastConfig().setEnabled(false);
        config.getNetworkConfig().getJoin().getTcpIpConfig()
                .setEnabled(true)
                .addMember("127.0.0.1");

        // Distributed Map Configuration for stock
        MapConfig stockMapConfig = new MapConfig();
        stockMapConfig.setName("flashsale-stock");
        stockMapConfig.setTimeToLiveSeconds(3600); // 1 hour TTL
        
        config.addMapConfig(stockMapConfig);

        return config;
    }
}
