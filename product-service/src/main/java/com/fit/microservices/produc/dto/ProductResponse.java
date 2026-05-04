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

    private String name;
    private String description;
    private String skuCode;
    private BigDecimal price;
    private String categoryName;
    private List<ImageResponse> imageResponses = new ArrayList<>();
}
