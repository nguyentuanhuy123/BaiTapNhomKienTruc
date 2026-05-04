package com.fit.microservice.mcp.dto;

import java.math.BigDecimal;


public class ProductResponse  {
    private String name;
    private String description;
    private String skuCode;
    private BigDecimal price;
    private String categoryName;

    public ProductResponse(String name, String description, String skuCode, BigDecimal price, String categoryName) {
        this.name = name;
        this.description = description;
        this.skuCode = skuCode;
        this.price = price;
        this.categoryName = categoryName;
    }

    public ProductResponse() {
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

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }


}
