package com.fit.microservices.produc.repository;

import com.fit.microservices.produc.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByProductIdOrderByCreatedAtDesc(Long productId);
    List<Review> findAllByOrderByCreatedAtDesc();
}
