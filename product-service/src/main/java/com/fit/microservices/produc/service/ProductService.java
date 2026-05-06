package com.fit.microservices.produc.service;

import com.fit.microservices.produc.dto.PaginatedResponse;
import com.fit.microservices.produc.dto.ProductRequest;
import com.fit.microservices.produc.dto.ProductResponse;
import com.fit.microservices.produc.model.Category;
import com.fit.microservices.produc.model.Product;

import java.util.List;

public interface ProductService {

    List<ProductResponse> findAll();
    PaginatedResponse<ProductResponse> findAll(int page, int size, String category, String brand, String color);
    PaginatedResponse<ProductResponse> findFlashSaleProducts(int page, int size);
    ProductResponse save(ProductRequest productRequest);
    Product findById(Long id);
    void  deleteById(Long id);
    ProductResponse update(Long id,ProductRequest productRequest);
    ProductResponse getProductResponseById(Long id);



}
