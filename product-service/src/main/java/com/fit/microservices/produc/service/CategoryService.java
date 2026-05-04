package com.fit.microservices.produc.service;

import com.fit.microservices.produc.dto.CategoryRequest;
import com.fit.microservices.produc.dto.CategoryResponse;
import com.fit.microservices.produc.model.Category;

import java.util.List;

public interface CategoryService {
    List<CategoryResponse> findAll();
    CategoryResponse save(CategoryRequest categoryRequest);
    CategoryResponse update(Long id,CategoryRequest categoryRequest);
    Category findById(Long id);
    void  deleteById(Long id);
}
