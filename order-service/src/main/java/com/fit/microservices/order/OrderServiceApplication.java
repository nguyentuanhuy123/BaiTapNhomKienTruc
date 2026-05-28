package com.fit.microservices.order;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Autowired;
import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.Statement;

@SpringBootApplication
@EnableFeignClients
public class OrderServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(OrderServiceApplication.class, args);
	}

	@Component
	public static class DatabaseInitializer implements CommandLineRunner {
		@Autowired
		private DataSource dataSource;

		@Override
		public void run(String... args) throws Exception {
			try (Connection conn = dataSource.getConnection();
				 Statement stmt = conn.createStatement()) {
				System.out.println("--- EXECUTING DATABASE ALTERATION: SET order_status TO VARCHAR(255) ---");
				stmt.execute("ALTER TABLE orders MODIFY COLUMN order_status VARCHAR(255)");
				System.out.println("--- DATABASE ALTERATION COMPLETED SUCCESSFULLY ---");
			} catch (Exception e) {
				System.err.println("--- DATABASE ALTERATION FAILED: " + e.getMessage() + " (This is normal if database is initializing or column is already VARCHAR(255))");
			}
		}
	}
}
