package com.fit.microservices.produc.service.Impl;

import com.fit.microservices.produc.dto.CategoryRequest;
import com.fit.microservices.produc.dto.CategoryResponse;
import com.fit.microservices.produc.model.Category;
import com.fit.microservices.produc.repository.CategoryRepository;
import com.fit.microservices.produc.service.CategoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements  CategoryService{
    private final CategoryRepository  categoryRepository;
    @Override
    @Cacheable(value = "allCategories", key = "'all'")
    public List<CategoryResponse> findAll() {
        log.info("Querying all categories...");
        return categoryRepository.findAll()
                .stream()
                .map(category->new CategoryResponse(category.getId(),category.getName(),category.getDescription()))
                .collect(Collectors.toList());
    }
    @Override
    public Category findById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + id));
    }
    @Override
    @CacheEvict(value = "allCategories", allEntries = true)
    public CategoryResponse save(CategoryRequest categoryRequest) {
        Category category = new Category();
        category.setName(categoryRequest.getName());
        category.setDescription(categoryRequest.getDescription());
        categoryRepository.save(category);
        log.info("Category save success.");
        return new  CategoryResponse(category.getId(),category.getName(),category.getDescription());
    }

    @Override
    @CacheEvict(value = "allCategories", allEntries = true)
    public CategoryResponse update(Long id, CategoryRequest categoryRequest) {
        Category category = findById(id);
        if(categoryRequest.getName() != null){
            category.setName(categoryRequest.getName());
        }
        if(categoryRequest.getDescription() != null){
            category.setDescription(categoryRequest.getDescription());
        }
        categoryRepository.save(category);
        return new   CategoryResponse(category.getId(),category.getName(),category.getDescription());
    }
    @Override
    @CacheEvict(value = "allCategories", allEntries = true)
    public void deleteById(Long id) {
        Category category = findById(id);
        categoryRepository.delete(category);
        log.info("Category delete success.");
    }
}
