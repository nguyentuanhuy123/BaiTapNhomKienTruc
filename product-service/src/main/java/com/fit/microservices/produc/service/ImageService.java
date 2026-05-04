package com.fit.microservices.produc.service;

import com.fit.microservices.produc.dto.ImageResponse;

import java.util.List;

public interface ImageService {
    List<ImageResponse> findAllByProductId(Long productId);
}
