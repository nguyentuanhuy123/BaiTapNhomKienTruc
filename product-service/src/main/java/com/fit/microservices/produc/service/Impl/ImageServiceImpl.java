package com.fit.microservices.produc.service.Impl;

import com.fit.microservices.produc.dto.ImageResponse;
import com.fit.microservices.produc.dto.ProductResponse;
import com.fit.microservices.produc.model.Image;
import com.fit.microservices.produc.model.Product;
import com.fit.microservices.produc.repository.ImageRepository;
import com.fit.microservices.produc.service.CategoryService;
import com.fit.microservices.produc.service.ImageService;
import com.fit.microservices.produc.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ImageServiceImpl implements ImageService {
    private final ImageRepository imageRepository;
    @Override
    public List<ImageResponse> findAllByProductId(Long productId) {
        List<Image> images= imageRepository.findAllByProductId(productId);
        if(images.isEmpty()){
            throw new RuntimeException("product not found");
        }
        return images
                .stream()
                .map(img-> new ImageResponse(
                        img.getId(),
                        img.getUrl()
                )).toList();
    }
}
