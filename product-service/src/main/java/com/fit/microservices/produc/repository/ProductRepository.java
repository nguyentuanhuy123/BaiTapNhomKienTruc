package com.fit.microservices.produc.repository;

import com.fit.microservices.produc.model.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.domain.Specification;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long>,
        JpaSpecificationExecutor<Product> {

    Optional<Product> findBySkuCode(String skuCode);


    @Override
    @EntityGraph(attributePaths = {"images", "category"})
    List<Product> findAll();

    @Override
    Page<Product> findAll(Specification<Product> spec, Pageable pageable);

    @Override
    @EntityGraph(attributePaths = {"images", "category"})
    Optional<Product> findById(Long id);

    @Query("""
        SELECT p FROM Product p
        WHERE p.discountPercentage > 0
        OR p.oldPrice IS NOT NULL
    """)
    Page<Product> findFlashSaleProducts(Pageable pageable);
}