package com.fit.microservices.produc.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ReviewResponse {
    private Long id;
    private Long productId;
    private String name;
    private String title;
    private String content;
    private Integer rating;
    private Boolean verified;
    private String image;
    private String date;
    private List<ReviewReplyResponse> replies;
}
