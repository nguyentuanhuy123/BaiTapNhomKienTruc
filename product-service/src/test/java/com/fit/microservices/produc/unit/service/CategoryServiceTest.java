package com.fit.microservices.produc.unit.service;

import com.fit.microservices.produc.dto.CategoryRequest;
import com.fit.microservices.produc.dto.CategoryResponse;
import com.fit.microservices.produc.model.Category;
import com.fit.microservices.produc.repository.CategoryRepository;
import com.fit.microservices.produc.service.Impl.CategoryServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CategoryServiceTest {
    @Mock
    private CategoryRepository categoryRepository;

    @InjectMocks
    private CategoryServiceImpl categoryService;

    private Category category;
    @BeforeEach
    void setUp() {
        category = Category.builder()
                .id(1L)
                .name("Iphone")
                .description("Iphone 15 với những cải tiến mới")
                .build();
    }
    // ===================== FIND ALL =====================
    @Test
    void testFindAll_ShouldReturnListOfCategories(){
        when(categoryRepository.findAll()).thenReturn(List.of(category));
        List<CategoryResponse> result = categoryService.findAll();

        assertNotNull(result);
        assertEquals(1, result.size());

        CategoryResponse response = result.get(0);
        assertEquals("Iphone", response.getName());

        verify(categoryRepository, times(1)).findAll();
    }

    // ===================== FIND BY ID =====================
    @Test
    void testFindByID_ShouldReturnCategory(){
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));
        Category result = categoryService.findById(1L);
        assertNotNull(result);
        assertEquals("Iphone", result.getName());
        verify(categoryRepository, times(1)).findById(1L);
    }
    @Test
    void testFindByID_ShouldReturnNotFound(){
        when(categoryRepository.findById(11L)).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> categoryService.findById(11L));
        verify(categoryRepository, times(1)).findById(11L);
    }
    // ===================== SAVE =====================
    @Test
    void testSave_ShouldReturnProductResponse(){
        CategoryRequest categoryRequest = new CategoryRequest();
        categoryRequest.setName("Iphone");
        categoryRequest.setDescription("Iphone 15 với những cải tiến mới");
        when(categoryRepository.save(any(Category.class))).thenReturn(category);
        CategoryResponse result = categoryService.save(categoryRequest);
        assertNotNull(result);
        assertEquals("Iphone", result.getName());
        verify(categoryRepository, times(1)).save(any(Category.class));
    }
    @Test
    void testUpdate_ShouldReturnProductResponse(){
        CategoryRequest categoryRequest = new CategoryRequest();
        categoryRequest.setName("Iphone");
        categoryRequest.setDescription("Iphone 15 promax với cải tiến camera");
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));
        when(categoryRepository.save(any(Category.class))).thenReturn(category);

        CategoryResponse result = categoryService.update(1L, categoryRequest);
        assertNotNull(result);
        assertEquals("Iphone 15 promax với cải tiến camera", result.getDescription());
        verify(categoryRepository).findById(1L);
        verify(categoryRepository, times(1)).save(any(Category.class));


    }
    // ===================== DELETE =====================
    @Test
    void testDeleteByID_ShouldCallRepository(){
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));
        categoryService.deleteById(1L);
        verify(categoryRepository, times(1)).findById(1L);
    }

}
