package com.fit.microservices.produc.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ReviewRequest {
    private Long productId;
    private String name;
    private String title;
    private String content;
    private Integer rating;
    private String image;
}
