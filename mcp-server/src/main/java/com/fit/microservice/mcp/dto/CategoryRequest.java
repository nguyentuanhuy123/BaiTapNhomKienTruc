package com.fit.microservice.mcp.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


public class CategoryRequest {
    @NotBlank(message = "Tên danh mục không được để trống")
    @Size(min = 3, max = 150, message = "Tên danh mục từ 3 đến 150 ký tự")
    private String name;
    @Size(max = 1000, message = "Mô tả không quá 1000 ký tự")
    private String description;

    public CategoryRequest(String name, String description) {
        this.name = name;
        this.description = description;
    }

    public CategoryRequest() {
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

}
