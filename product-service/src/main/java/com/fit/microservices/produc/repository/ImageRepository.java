package com.fit.microservices.produc.repository;

import com.fit.microservices.produc.dto.ImageResponse;
import com.fit.microservices.produc.model.Image;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ImageRepository extends JpaRepository<Image, Long> {
    List<Image> findAllByProductId(Long productId);
}
