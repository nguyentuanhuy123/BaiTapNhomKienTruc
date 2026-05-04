package com.fit.microservices.user.config;
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
    public OpenAPI userServiceAPI(){
        return new OpenAPI()
                .info(new Info()
                        .title("User Service API")
                        .description("Rest API for managing users in the User Service")
                        .version("v0.0.1")
                        .contact(new Contact()
                                .name("User Service Team")
                                .email("support@user-service.com")
                                .url("https://user-service.com"))
                        .license(new License()
                                .name("Apache 2.0")
                                .url("https://www.apache.org/licenses/LICENSE-2.0.html"))
                )
                .externalDocs(new ExternalDocumentation()
                .description("User Service Wiki Documentation")
                .url("https://user-service-dummy-url.com/docs"));
    }
}
