package com.fit.microservice.mcp.tool;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fit.microservice.mcp.client.CategoryClient;
import com.fit.microservice.mcp.client.ProductClient;
import com.fit.microservice.mcp.dto.CategoryResponse;
import com.fit.microservice.mcp.dto.ProductRequest;
import com.fit.microservice.mcp.dto.ProductResponse;
import org.springframework.ai.tool.annotation.Tool;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class ProductMcpTool {

    private final ProductClient productClient;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final CategoryClient categoryClient;
    public ProductMcpTool(ProductClient productClient, CategoryClient categoryClient) {
        this.productClient = productClient;
        this.categoryClient = categoryClient;
    }


//    @Tool(
//            name = "listProducts",
//            description = "Lấy danh sách sản phẩm hiện có trong hệ thống"
//    )
//    public String listProducts() throws JsonProcessingException {
//        List<ProductResponse> products = productClient.getAllProducts();
//        Map<String, Object> response = Map.of(
//                "total", products.size(),
//                "products", products
//        );
//        return objectMapper.writeValueAsString(response);
//    }

    @Tool(
            name = "listProducts",
            description = "Lấy danh sách sản phẩm hiện có trong hệ thống"
    )
    public Map<String, Object> listProducts() {
        List<ProductResponse> products = productClient.getAllProducts();
        return Map.of(
                "total", products.size(),
                "products", products
        );
    }

    @Tool(
            name = "listCategories",
            description = "Lấy danh sách danh mục sản phẩm"
    )
    public Map<String, Object> listCategories() {
        List<CategoryResponse> categories = categoryClient.findAll();
        return Map.of(
                "total", categories.size(),
                "categories", categories
        );
    }
    @Tool(
            name = "createProduct",
            description = """
                    Tạo sản phẩm mới.
                    Bắt buộc người dùng cung cấp:
                    - name
                    - skuCode
                    - price
                    - categoryId
                    Nếu thiếu thông tin, hãy hỏi lại người dùng.
                """
                )
    public ProductResponse createProduct(ProductRequest request) {
        return productClient.addProduct(request);
    }



}
