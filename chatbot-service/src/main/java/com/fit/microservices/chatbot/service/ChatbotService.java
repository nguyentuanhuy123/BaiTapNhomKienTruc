package com.fit.microservices.chatbot.service;

import com.fit.microservices.chatbot.client.ProductClient;
import com.fit.microservices.chatbot.dto.ChatResponse;
import com.fit.microservices.chatbot.dto.ChatResponse.RecommendedProduct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.*;

@Service
public class ChatbotService {

    @Autowired
    private ProductClient productClient;

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    private final RestTemplate restTemplate = createUnsecuredRestTemplate();

    private RestTemplate createUnsecuredRestTemplate() {
        try {
            javax.net.ssl.TrustManager[] trustAllCerts = new javax.net.ssl.TrustManager[]{
                new javax.net.ssl.X509TrustManager() {
                    public java.security.cert.X509Certificate[] getAcceptedIssuers() {
                        return new java.security.cert.X509Certificate[0];
                    }
                    public void checkClientTrusted(java.security.cert.X509Certificate[] certs, String authType) {}
                    public void checkServerTrusted(java.security.cert.X509Certificate[] certs, String authType) {}
                }
            };

            javax.net.ssl.SSLContext sc = javax.net.ssl.SSLContext.getInstance("SSL");
            sc.init(null, trustAllCerts, new java.security.SecureRandom());
            javax.net.ssl.HttpsURLConnection.setDefaultSSLSocketFactory(sc.getSocketFactory());

            javax.net.ssl.HostnameVerifier allHostsValid = new javax.net.ssl.HostnameVerifier() {
                public boolean verify(String hostname, javax.net.ssl.SSLSession session) {
                    return true;
                }
            };
            javax.net.ssl.HttpsURLConnection.setDefaultHostnameVerifier(allHostsValid);

            return new RestTemplate();
        } catch (Exception e) {
            return new RestTemplate();
        }
    }

    public ChatResponse getRecommendation(String prompt) {
        String lowerPrompt = prompt.toLowerCase();
        
        // Fetch all products for context (RAG)
        List<RecommendedProduct> allProducts = fetchAllProductsForContext(null);

        // 1. If API Key is configured and is NOT the placeholder, call real Gemini API!
        if (apiKey != null && !apiKey.isEmpty() && !apiKey.contains("YourPlaceholderKey")) {
            try {
                // Construct System instruction prompt with real-time product context
                StringBuilder systemPrompt = new StringBuilder();
                systemPrompt.append("Bạn là trợ lý AI thông minh tư vấn bán hàng của Aero-Tech (cửa hàng đồ thể thao cao cấp).\n");
                systemPrompt.append("Dưới đây là danh sách sản phẩm thật đang có sẵn trong cửa hàng:\n");
                for (RecommendedProduct p : allProducts) {
                    systemPrompt.append(String.format("- ID: %d, Tên sản phẩm: %s, Giá: $%s, Loại: %s, Mô tả: %s\n", 
                            p.getId(), p.getName(), p.getPrice().toString(), p.getCategory(), p.getDescription()));
                }
                systemPrompt.append("\nHãy trò chuyện thân thiện, nhiệt tình, lịch sự bằng tiếng Việt. Nếu người dùng hỏi mua hoặc cần tư vấn tìm đồ, hãy chủ động gợi ý các sản phẩm phù hợp nhất từ danh sách trên.\n");
                systemPrompt.append("Không được bịa đặt tên sản phẩm nằm ngoài danh sách trên.\n");
                systemPrompt.append("Câu hỏi của khách hàng: ").append(prompt);

                // Call Google Gemini REST API
                String requestUrl = apiUrl + "?key=" + apiKey;
                
                Map<String, Object> requestBody = new HashMap<>();
                Map<String, Object> contentMap = new HashMap<>();
                Map<String, Object> partMap = new HashMap<>();
                partMap.put("text", systemPrompt.toString());
                contentMap.put("parts", Collections.singletonList(partMap));
                requestBody.put("contents", Collections.singletonList(contentMap));
                
                Map<?, ?> response = restTemplate.postForObject(requestUrl, requestBody, Map.class);
                if (response != null && response.containsKey("candidates")) {
                    List<?> candidates = (List<?>) response.get("candidates");
                    if (candidates != null && !candidates.isEmpty() && candidates.get(0) instanceof Map) {
                        Map<?, ?> candidate = (Map<?, ?>) candidates.get(0);
                        Map<?, ?> content = (Map<?, ?>) candidate.get("content");
                        List<?> parts = (List<?>) content.get("parts");
                        if (parts != null && !parts.isEmpty() && parts.get(0) instanceof Map) {
                            String aiReply = (String) ((Map<?, ?>) parts.get(0)).get("text");
                            
                            // Match recommended products from AI response text
                            List<RecommendedProduct> matched = new ArrayList<>();
                            for (RecommendedProduct p : allProducts) {
                                if (aiReply.toLowerCase().contains(p.getName().toLowerCase()) || 
                                    aiReply.contains(p.getId().toString()) ||
                                    (p.getSkuCode() != null && aiReply.toLowerCase().contains(p.getSkuCode().toLowerCase()))) {
                                    matched.add(p);
                                }
                            }
                            
                            // Fallback category matching if no specific product was matched
                            if (matched.isEmpty()) {
                                if (aiReply.toLowerCase().contains("giày") || aiReply.toLowerCase().contains("shoes")) {
                                    for (RecommendedProduct p : allProducts) {
                                        if ("Running".equalsIgnoreCase(p.getCategory()) || "Lifestyle".equalsIgnoreCase(p.getCategory())) {
                                            matched.add(p);
                                        }
                                    }
                                } else if (aiReply.toLowerCase().contains("áo") || aiReply.toLowerCase().contains("quần")) {
                                    for (RecommendedProduct p : allProducts) {
                                        if ("Clothing".equalsIgnoreCase(p.getCategory())) {
                                            matched.add(p);
                                        }
                                    }
                                }
                            }
                            
                            if (matched.size() > 4) {
                                matched = matched.subList(0, 4);
                            }
                            
                            return new ChatResponse(aiReply, matched);
                        }
                    }
                }
            } catch (Exception e) {
                System.err.println("Failed to call Gemini API, falling back to local NLP: " + e.getMessage());
            }
        }

        // 2. Offline Mode (Local NLP Intent Extractor Fallback)
        String categoryFilter = null;
        if (lowerPrompt.contains("giày") || lowerPrompt.contains("shoes") || lowerPrompt.contains("sneaker")) {
            if (lowerPrompt.contains("chạy") || lowerPrompt.contains("running")) {
                categoryFilter = "Running";
            } else if (lowerPrompt.contains("thời trang") || lowerPrompt.contains("lifestyle") || lowerPrompt.contains("phố")) {
                categoryFilter = "Lifestyle";
            } else {
                categoryFilter = "Running";
            }
        } else if (lowerPrompt.contains("áo") || lowerPrompt.contains("quần") || lowerPrompt.contains("clothing") || lowerPrompt.contains("shirt")) {
            categoryFilter = "Clothing";
        }

        List<RecommendedProduct> recommendedProducts = fetchAllProductsForContext(categoryFilter);
        String responseText = "";

        if (categoryFilter != null) {
            responseText = "Dạ chào anh/chị! Em đã tìm thấy các mẫu sản phẩm **" + categoryFilter + "** cực kỳ thể thao và cao cấp của Aero-Tech phù hợp với nhu cầu của anh/chị đây ạ. Anh/chị xem qua các mẫu dưới đây và có thể đặt hàng trực tiếp nhé! 🚀";
        } else if (lowerPrompt.contains("hi") || lowerPrompt.contains("chào") || lowerPrompt.contains("hello")) {
            responseText = "Xin chào! Em là Trợ lý AI Aero-Tech. Em có thể giúp anh/chị tìm kiếm các mẫu giày chạy bộ, giày thời trang hoặc các sản phẩm thể thao phù hợp nhất. Anh/chị đang quan tâm đến dòng sản phẩm nào ạ? 👟";
        } else if (lowerPrompt.contains("khuyến mãi") || lowerPrompt.contains("flash sale") || lowerPrompt.contains("giảm giá")) {
            responseText = "Hiện tại Aero-Tech đang có chương trình **Flash Sale siêu hấp dẫn** diễn ra ngay trên trang chủ đó ạ! Dưới đây là một số sản phẩm đang được giảm giá cực sâu mà anh/chị không nên bỏ lỡ:";
        } else {
            responseText = "Dạ chào anh/chị, em là Trợ lý mua sắm của Aero-Tech! Đây là một số sản phẩm bán chạy nhất hiện nay của cửa hàng, anh/chị xem thử xem có đôi giày hay trang phục nào ưng ý không nhé! ✨";
        }

        if (recommendedProducts.size() > 4) {
            recommendedProducts = recommendedProducts.subList(0, 4);
        }

        return new ChatResponse(responseText, recommendedProducts);
    }

    private List<RecommendedProduct> fetchAllProductsForContext(String categoryFilter) {
        List<RecommendedProduct> list = new ArrayList<>();
        try {
            Map<String, Object> productsPage = productClient.findAllProducts(0, 30, categoryFilter, null, null);
            if (productsPage != null && productsPage.containsKey("content")) {
                List<?> contentList = (List<?>) productsPage.get("content");
                for (Object item : contentList) {
                    if (item instanceof Map) {
                        Map<?, ?> prod = (Map<?, ?>) item;
                        Long id = ((Number) prod.get("id")).longValue();
                        String name = (String) prod.get("name");
                        String description = (String) prod.get("description");
                        BigDecimal price = BigDecimal.valueOf(((Number) prod.get("price")).doubleValue());
                        String imageUrl = "";
                        if (prod.get("imageResponses") != null && prod.get("imageResponses") instanceof List) {
                            List<?> imageList = (List<?>) prod.get("imageResponses");
                            if (!imageList.isEmpty() && imageList.get(0) instanceof Map) {
                                imageUrl = (String) ((Map<?, ?>) imageList.get(0)).get("url");
                            }
                        }
                        String categoryName = "";
                        if (prod.get("category") != null && prod.get("category") instanceof Map) {
                            categoryName = (String) ((Map<?, ?>) prod.get("category")).get("name");
                        }
                        String skuCode = (String) prod.get("skuCode");

                        list.add(new RecommendedProduct(id, name, description, price, imageUrl, categoryName, skuCode));
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Error fetching products: " + e.getMessage());
        }
        return list;
    }
}
