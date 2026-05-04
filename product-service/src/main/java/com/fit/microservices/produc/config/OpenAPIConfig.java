package com.fit.microservices.produc.config;
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
    public OpenAPI productServiceAPI(){
        return new OpenAPI()
                .info(new Info()
                        .title("Product Service API")
                        .description("Rest API for managing products in the Product Service")
                        .version("v0.0.1")
                        .contact(new Contact()
                                .name("Product Service Team")
                                .email("support@product-service.com")
                                .url("https://product-service.com"))
                        .license(new License()
                                .name("Apache 2.0")
                                .url("https://www.apache.org/licenses/LICENSE-2.0.html"))
                )
                .externalDocs(new ExternalDocumentation()
                .description("Product Service Wiki Documentation")
                .url("https://product-service-dummy-url.com/docs"));
    }
}
