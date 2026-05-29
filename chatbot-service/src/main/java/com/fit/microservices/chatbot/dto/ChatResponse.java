package com.fit.microservices.chatbot.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatResponse {
    private String responseText;
    private List<RecommendedProduct> products;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecommendedProduct {
        private Long id;
        private String name;
        private String description;
        private BigDecimal price;
        private String imageUrl;
        private String category;
        private String skuCode;
    }
}
