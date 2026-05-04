package com.fit.microservices.order.config;
import io.swagger.v3.oas.models.ExternalDocumentation;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenAPIConfig {
    @Bean
    public OpenAPI orderServiceAPI(){
        return new OpenAPI()
                .info(new Info()
                        .title("Order Service API")
                        .description("Rest API for managing orders in the Order Service")
                        .version("v0.0.1")
                        .contact(new Contact()
                                .name("Order Service Team")
                                .email("support@order-service.com")
                                .url("https://order-service.com"))
                        .license(new License()
                                .name("Apache 2.0")
                                .url("https://www.apache.org/licenses/LICENSE-2.0.html"))
                )
                .externalDocs(new ExternalDocumentation()
                .description("Order Service Wiki Documentation")
                .url("https://order-service-dummy-url.com/docs"));
    }
}
