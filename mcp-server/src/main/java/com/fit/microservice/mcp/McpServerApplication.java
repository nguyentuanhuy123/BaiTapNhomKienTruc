package com.fit.microservice.mcp;

import com.fit.microservice.mcp.tool.ProductMcpTool;
import org.springframework.ai.support.ToolCallbacks;
import org.springframework.ai.tool.ToolCallback;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.context.annotation.Bean;

import java.util.List;

@SpringBootApplication
@EnableFeignClients
public class McpServerApplication {

	public static void main(String[] args) {
		SpringApplication.run(McpServerApplication.class, args);
	}
    @Bean
    public List<ToolCallback> productToolCallback(ProductMcpTool productMcpTool){
        return List.of(ToolCallbacks.from(productMcpTool));
    }



}
