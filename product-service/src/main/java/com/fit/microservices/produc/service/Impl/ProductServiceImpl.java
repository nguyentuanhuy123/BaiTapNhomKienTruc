package com.fit.microservices.produc.service.Impl;

import com.fit.microservices.produc.dto.ImageResponse;
import com.fit.microservices.produc.dto.PaginatedResponse;
import com.fit.microservices.produc.dto.ProductRequest;
import com.fit.microservices.produc.dto.ProductResponse;
import com.fit.microservices.produc.model.Category;
import com.fit.microservices.produc.model.Image;
import com.fit.microservices.produc.model.Product;
import com.fit.microservices.produc.repository.CategoryRepository;
import com.fit.microservices.produc.repository.ProductRepository;
import com.fit.microservices.produc.service.ProductService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductServiceImpl implements ProductService {
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    @Override
    @Cacheable(value = "allProducts", key = "'all'")
    public List<ProductResponse> findAll() {
        System.out.println("Querying DB ...");

        return productRepository.findAll()
                .stream()
                .map(this::mapToProductResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Cacheable(value = "products_page", key = "#page + '-' + #size + '-' + #category + '-' + #brand + '-' + #color")
    public PaginatedResponse<ProductResponse> findAll(int page, int size, String category, String brand, String color) {
        log.info("Fetching products from DB - Page: {}, Size: {}, Category: {}", page, size, category);
        Pageable pageable = PageRequest.of(page, size);
        
        Specification<Product> spec = (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();
            
            if (category != null && !category.isEmpty() && !category.equalsIgnoreCase("All")) {
                predicates.add(criteriaBuilder.equal(root.get("category").get("name"), category));
            }
            
            if (brand != null && !brand.isEmpty() && !brand.equalsIgnoreCase("All")) {
                predicates.add(criteriaBuilder.equal(root.get("brand"), brand));
            }
            
            if (color != null && !color.isEmpty() && !color.equalsIgnoreCase("All")) {
                predicates.add(criteriaBuilder.isMember(color, root.get("colors")));
            }
            
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };

        Page<Product> products = productRepository.findAll(spec, pageable);
        List<ProductResponse> content = products.getContent().stream()
                .map(this::mapToProductResponse)
                .collect(Collectors.toList());

        return PaginatedResponse.<ProductResponse>builder()
                .content(content)
                .pageNo(products.getNumber())
                .pageSize(products.getSize())
                .totalElements(products.getTotalElements())
                .totalPages(products.getTotalPages())
                .last(products.isLast())
                .build();
    }


    @Override
    @Cacheable(value = "flash_sale", key = "#page + '-' + #size")
    public PaginatedResponse<ProductResponse> findFlashSaleProducts(int page, int size) {
        log.info("Fetching flash sale products from DB - Page: {}", page);
        Pageable pageable = PageRequest.of(page, size);
        Page<Product> products = productRepository.findFlashSaleProducts(pageable);
        List<ProductResponse> content = products.getContent().stream()
                .map(this::mapToProductResponse)
                .collect(Collectors.toList());

        return PaginatedResponse.<ProductResponse>builder()
                .content(content)
                .pageNo(products.getNumber())
                .pageSize(products.getSize())
                .totalElements(products.getTotalElements())
                .totalPages(products.getTotalPages())
                .last(products.isLast())
                .build();
    }

    @Override
    public Product findById(Long id) {
        return productRepository.findById(id).orElse(null);
    }

    @Override
    @CacheEvict(value = {"allProducts", "products_page", "product_detail", "flash_sale"}, allEntries = true)
    public ProductResponse save(ProductRequest productRequest) {
        Product product = new Product();
        updateProductFields(product, productRequest);
        
        List<Image> images = productRequest.getImages()
                .stream()
                .map(img -> {
                    Image image = new Image();
                    image.setName(img.getName());
                    image.setUrl(img.getUrl());
                    image.setProduct(product);
                    return image;
                })
                .toList();
        product.setImages(images);
        
        Product savedProduct = productRepository.save(product);
        log.info("Product save success.");
        return mapToProductResponse(savedProduct);
    }

    private void updateProductFields(Product product, ProductRequest productRequest) {
        if (productRequest.getName() != null) product.setName(productRequest.getName());
        if (productRequest.getDescription() != null) product.setDescription(productRequest.getDescription());
        if (productRequest.getSkuCode() != null) product.setSkuCode(productRequest.getSkuCode());
        if (productRequest.getPrice() != null) product.setPrice(productRequest.getPrice());
        if (productRequest.getOldPrice() != null) product.setOldPrice(productRequest.getOldPrice());
        if (productRequest.getDiscountPercentage() != null) product.setDiscountPercentage(productRequest.getDiscountPercentage());
        if (productRequest.getIsNew() != null) product.setIsNew(productRequest.getIsNew());
        if (productRequest.getBrand() != null) product.setBrand(productRequest.getBrand());
        if (productRequest.getFoamTech() != null) product.setFoamTech(productRequest.getFoamTech());
        if (productRequest.getPlateTech() != null) product.setPlateTech(productRequest.getPlateTech());
        if (productRequest.getUpperTech() != null) product.setUpperTech(productRequest.getUpperTech());
        if (productRequest.getColors() != null) product.setColors(new ArrayList<>(productRequest.getColors()));
        if (productRequest.getSizes() != null) product.setSizes(new ArrayList<>(productRequest.getSizes()));
        
        if (productRequest.getCategoryId() != null) {
            Category category = categoryRepository.findById(productRequest.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category không tồn tại"));
            product.setCategory(category);
        }
    }

    @Override
    @Cacheable(value = "product_detail", key = "#id")
    public ProductResponse getProductResponseById(Long id) {
        log.info("Fetching product detail from DB - ID: {}", id);
        return mapToProductResponse(findById(id));
    }

    public ProductResponse mapToProductResponse(Product product) {
        if (product == null) {
            return null; // or throw a specific exception gracefully
        }
        List<ImageResponse> imageResponses = product.getImages()
                .stream()
                .map(image -> new ImageResponse(image.getId(), image.getUrl()))
                .toList();

        ProductResponse response = new ProductResponse();
        response.setId(product.getId());
        response.setName(product.getName());
        response.setDescription(product.getDescription());
        response.setSkuCode(product.getSkuCode());
        response.setPrice(product.getPrice());
        response.setOldPrice(product.getOldPrice());
        response.setDiscountPercentage(product.getDiscountPercentage());
        response.setIsNew(product.getIsNew());
        response.setBrand(product.getBrand());
        response.setFoamTech(product.getFoamTech());
        response.setPlateTech(product.getPlateTech());
        response.setUpperTech(product.getUpperTech());
        response.setColors(new ArrayList<>(product.getColors()));
        response.setSizes(new ArrayList<>(product.getSizes()));
        response.setCategoryName(product.getCategory() != null ? product.getCategory().getName() : null);
        response.setImageResponses(imageResponses);
        return response;
    }

    @Override
    @CacheEvict(value = {"allProducts", "products_page", "product_detail", "flash_sale"}, allEntries = true)
    public void deleteById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product không tồn tại"));
        productRepository.delete(product);
        log.info("Product delete success.");
    }

    @Override
    @CacheEvict(value = {"allProducts", "products_page", "product_detail", "flash_sale"}, allEntries = true)
    @Transactional
    public ProductResponse update(Long id, ProductRequest productRequest) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product không tồn tại"));
        
        updateProductFields(product, productRequest);

        if (productRequest.getImages() != null) {
            product.getImages().clear();
            List<Image> newImages = productRequest.getImages()
                    .stream()
                    .map(img -> {
                        Image image = new Image();
                        image.setName(img.getName());
                        image.setUrl(img.getUrl());
                        image.setProduct(product);
                        return image;
                    })
                    .toList();
            product.getImages().addAll(newImages);
        }

        Product savedProduct = productRepository.save(product);
        return mapToProductResponse(savedProduct);
    }
}
