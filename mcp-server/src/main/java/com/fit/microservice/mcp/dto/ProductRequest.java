package com.fit.microservice.mcp.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;


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

    public ProductRequest(String name, String description, String skuCode, BigDecimal price, Long categoryId) {
        this.name = name;
        this.description = description;
        this.skuCode = skuCode;
        this.price = price;
        this.categoryId = categoryId;
    }

    public ProductRequest() {
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getSkuCode() {
        return skuCode;
    }

    public void setSkuCode(String skuCode) {
        this.skuCode = skuCode;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }
}
