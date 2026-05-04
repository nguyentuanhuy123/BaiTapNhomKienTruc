package com.fit.microservices.produc.repository;

import com.fit.microservices.produc.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category,Long> {
}
