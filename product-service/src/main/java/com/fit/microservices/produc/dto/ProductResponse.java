package com.fit.microservices.produc.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
public class ProductResponse implements Serializable {

    private Long id;
    private String name;
    private String description;
    private String skuCode;
    private BigDecimal price;
    private BigDecimal oldPrice;
    private Integer discountPercentage;
    private Boolean isNew;
    private String brand;
    private String foamTech;
    private String plateTech;
    private String upperTech;
    private List<String> colors;
    private List<Double> sizes;
    private Long categoryId;
    private String categoryName;
    private String image;
    private List<ImageResponse> imageResponses = new ArrayList<>();
}
