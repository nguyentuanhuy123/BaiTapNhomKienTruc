package com.fit.microservices.produc.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
public class ProductRequest {
    @NotBlank(message = "Tên sản phẩm không được để trống")
    @Size(min=3,max = 150, message = "Tên sản phẩm từ 3 đến 150 ký tự")
    private String name;
    @Size(max = 1000, message = "Mô tả không quá 1000 ký tự")
    private String description;
    @NotBlank(message = "SKU không được để trống")
    @Size(max = 50, message = "SKU tối đa 50 ký tự")
    private String skuCode;
    @NotNull(message = "Giá sản phẩm không được để trống")
    @Positive(message = "Giá sản phẩm phải lớn hơn 0")
    private BigDecimal price;
    @NotNull(message = "Category không được để trống")
    private Long categoryId;
    @NotEmpty(message = "Sản phẩm phải có ít nhất 1 hình ảnh")
    private List<@Valid ImageRequest> images;
}
