package com.fit.microservices.produc.repository;

import com.fit.microservices.produc.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product,Long>, JpaSpecificationExecutor<Product> {
    Optional<Product> findBySkuCode(String skuCode);

    @Query("SELECT p FROM Product p WHERE p.discountPercentage > 0 OR p.oldPrice IS NOT NULL")
    Page<Product> findFlashSaleProducts(Pageable pageable);
}
