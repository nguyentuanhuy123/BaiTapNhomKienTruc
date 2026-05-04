package com.fit.microservices.produc.unit.service;

import com.fit.microservices.produc.dto.ImageRequest;
import com.fit.microservices.produc.dto.ImageResponse;
import com.fit.microservices.produc.dto.ProductRequest;
import com.fit.microservices.produc.dto.ProductResponse;
import com.fit.microservices.produc.model.Category;
import com.fit.microservices.produc.model.Image;
import com.fit.microservices.produc.model.Product;
import com.fit.microservices.produc.repository.CategoryRepository;
import com.fit.microservices.produc.repository.ImageRepository;
import com.fit.microservices.produc.repository.ProductRepository;
import com.fit.microservices.produc.service.Impl.ProductServiceImpl;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private ImageRepository imageRepository;

    @InjectMocks
    private ProductServiceImpl productService;

    private Category category;
    private Product product;

    @BeforeEach
    void setUp() {
        category = Category.builder()
                .id(1L)
                .name("IPhone")
                .build();
        Image image1 = Image.builder()
                .id(1L)
                .name("Iphone 15 màu đỏ")
                .url("https://mrcau.com/iphone-15-pro-max-mau-do-ruou-tren-tay-nhin-quyen-ru-va-sang-chanh-the-nay-ifan-khong-me-moi-la?srsltid=AfmBOooCculMyYboOmtDt0Puz1vS6ejkcBNn7ZqxkHxsTrAJNnNoVP1A")
                .build();
        Image image2 = Image.builder()
                .id(1L)
                .name("Iphone 15 màu đen")
                .url("https://mrcau.com/iphone-15-pro-max-mau-do-ruou-tren-tay-nhin-quyen-ru-va-sang-chanh-the-nay-ifan-khong-me-moi-la?srsltid=AfmBOooCculMyYboOmtDt0Puz1vS6ejkcBNn7ZqxkHxsTrAJNnNoVP1A")
                .build();
        product = Product.builder()
                .id(1L)
                .name("Iphone 15")
                .description("Apple phone")
                .skuCode("IP15")
                .price(BigDecimal.valueOf(1500))
                .category(category)
                .images(List.of(image1,image2))
                .build();
    }

    // ===================== FIND ALL =====================
    @Test
    void findAll_ShouldReturnListOfProductResponse() {
        // given
        when(productRepository.findAll()).thenReturn(List.of(product));

        // when
        List<ProductResponse> result = productService.findAll();

        // then
        assertNotNull(result);
        assertEquals(1, result.size());

        ProductResponse response = result.get(0);
        assertEquals("Iphone 15", response.getName());
        assertEquals("Apple phone", response.getDescription());
        assertEquals("IP15", response.getSkuCode());
        assertEquals(BigDecimal.valueOf(1500), response.getPrice());
        assertEquals("IPhone", response.getCategoryName());

        verify(productRepository, times(1)).findAll();
    }

    // ===================== FIND BY ID =====================
    @Test
    void findById_ShouldReturnProduct() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));

        Product result = productService.findById(1L);

        assertNotNull(result);
        assertEquals("Iphone 15", result.getName());

        verify(productRepository).findById(1L);
    }

    // ===================== SAVE =====================
    @Test
    void save_ShouldReturnProductResponse() {
        ProductRequest request = new ProductRequest();
        request.setName("Iphone 15");
        request.setDescription("Apple phone");
        request.setSkuCode("IP15");
        request.setPrice(BigDecimal.valueOf(1500));
        request.setCategoryId(1L);
        request.setImages(List.of(
                new ImageRequest("mau do", "https://img1.com"),
                new ImageRequest("mau den", "https://img2.com")
        ));

        when(categoryRepository.findById(1L))
                .thenReturn(Optional.of(category));
        Product savedProduct = Product.builder()
                .id(1L)
                .name("Iphone 15")
                .description("Apple phone")
                .skuCode("IP15")
                .price(BigDecimal.valueOf(1500))
                .category(category)
                .images(List.of(
                        Image.builder().id(1L).url("https://img1.com").build(),
                        Image.builder().id(2L).url("https://img2.com").build()
                ))
                .build();

        when(productRepository.save(any(Product.class)))
                .thenReturn(savedProduct);

        ProductResponse response = productService.save(request);

        assertNotNull(response);
        assertEquals("Iphone 15", response.getName());
        assertEquals("IPhone", response.getCategoryName());

        verify(categoryRepository).findById(1L);
        verify(productRepository).save(any(Product.class));
    }


    // ===================== UPDATE =====================
    @Test
    void update_ShouldReturnUpdatedProductResponse() {
        ProductRequest request = new ProductRequest();
        request.setName("Iphone 15 Pro");
        request.setDescription("Apple phone Pro");
        request.setSkuCode("IP15PRO");
        request.setPrice(BigDecimal.valueOf(1800));
        request.setCategoryId(1L);

        when(productRepository.findById(1L))
                .thenReturn(Optional.of(product));
        when(categoryRepository.findById(1L))
                .thenReturn(Optional.of(category));
        when(productRepository.save(any(Product.class)))
                .thenReturn(product);

        ProductResponse response = productService.update(1L, request);

        assertNotNull(response);
        assertEquals("Iphone 15 Pro", response.getName());

        verify(productRepository).findById(1L);
        verify(productRepository).save(any(Product.class));
    }

    // ===================== DELETE =====================
    @Test
    void deleteById_ShouldCallRepository() {
        when(productRepository.findById(1L))
                .thenReturn(Optional.of(product));

        productService.deleteById(1L);

        verify(productRepository).delete(product);
    }

}
