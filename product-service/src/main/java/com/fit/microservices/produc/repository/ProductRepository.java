package com.fit.microservices.produc.repository;

import com.fit.microservices.produc.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product,Long> {
}
