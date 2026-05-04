
package com.fit.microservices.produc;
import com.fit.microservices.produc.ProductServiceApplication;
import io.restassured.RestAssured;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;


import static org.hamcrest.Matchers.*;


@SpringBootTest(
        classes = ProductServiceApplication.class,
        webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT
)

class ProductServiceApplicationTests {



    @LocalServerPort
    private int port;

    @BeforeEach
    void setup() {
        RestAssured.baseURI = "http://localhost";
        RestAssured.port = port;

	RestAssured.authentication = RestAssured.preemptive().basic("admin@gmail.com", "admin123");
    }

    @Test
    void shouldCreateProduct() {
        String requestBody = """
                {
                    "name":"Iphone15",
                    "description":"Iphone15 256GB",
                    "skuCode":"IPHONE-15",
                    "price":1000,
                    "categoryId":1
                }
                """;

        RestAssured.given()
                .contentType("application/json")
                .body(requestBody)
                .when()
                .post("/api/product")
                .then()
                .statusCode(201)
                .body("id", notNullValue())
                .body("name", equalTo("Iphone15"))
                .body("description", equalTo("Iphone15 256GB"))
                .body("skuCode", equalTo("IPHONE-15"))
                .body("price", equalTo(1000))
                .body("categoryId", equalTo(1));
    }

    @Test
    void shouldUpdateProduct() {
        // Tạo product trước
        String createRequest = """
            {
                "name": "Iphone15",
                "description": "Iphone15 256GB",
                "skuCode": "IPHONE-15",
                "price": 1000,
                "categoryId": 1
            }
            """;

        int productId = RestAssured.given()
                .contentType("application/json")
                .body(createRequest)
                .when()
                .post("/api/product")
                .then()
                .statusCode(201)
                .extract()
                .path("id");

        // Chuẩn bị request update
        String updateRequest = """
            {
                "name": "Iphone15 Pro",
                "description": "Iphone15 512GB",
                "skuCode": "IPHONE-15-PRO",
                "price": 1500,
                "categoryId": 1
            }
            """;

        // Gọi PUT update
        RestAssured.given()
                .contentType("application/json")
                .body(updateRequest)
                .when()
                .put("/api/product/{id}", productId)
                .then()
                .statusCode(200)
                .body("id", equalTo(productId))
                .body("name", equalTo("Iphone15 Pro"))
                .body("description", equalTo("Iphone15 512GB"))
                .body("skuCode", equalTo("IPHONE-15-PRO"))
                .body("price", equalTo(1500))
                .body("categoryId", equalTo(1));
    }

    @Test
    void shouldDeleteProduct() {
        String requestBody = """
            {
                "name": "Iphone15",
                "description": "Iphone15 256GB",
                "skuCode": "IPHONE-15",
                "price": 1000,
                "categoryId": 1
            }
            """;

        int productId = RestAssured.given()
                .contentType("application/json")
                .body(requestBody)
                .when()
                .post("/api/product")
                .then()
                .statusCode(201)
                .extract()
                .path("id");

        // Gọi DELETE
        RestAssured.given()
                .when()
                .delete("/api/product/{id}", productId)
                .then()
                .statusCode(204);

        // Kiểm tra product đã xóa
        RestAssured.given()
                .when()
                .get("/api/product")
                .then()
                .statusCode(200)
                .body("id", not(hasItem(productId)));
    }

    @Test
    void shouldGetAllProducts() {
        // Tạo product 1
        String product1 = """
            {
                "name": "Iphone15",
                "description": "Iphone15 256GB",
                "skuCode": "IPHONE-15",
                "price": 1000,
                "categoryId": 1
            }
            """;

        int id1 = RestAssured.given()
                .contentType("application/json")
                .body(product1)
                .when()
                .post("/api/product")
                .then()
                .statusCode(201)
                .extract()
                .path("id");

        // Tạo product 2
        String product2 = """
            {
                "name": "Iphone15 Pro",
                "description": "Iphone15 512GB",
                "skuCode": "IPHONE-15-PRO",
                "price": 1500,
                "categoryId": 1
            }
            """;

        int id2 = RestAssured.given()
                .contentType("application/json")
                .body(product2)
                .when()
                .post("/api/product")
                .then()
                .statusCode(201)
                .extract()
                .path("id");

        // Gọi GET all
        RestAssured.given()
                .when()
                .get("/api/product")
                .then()
                .statusCode(200)
                .body("size()", equalTo(2))
                .body("name", hasItems("Iphone15", "Iphone15 Pro"))
                .body("skuCode", hasItems("IPHONE-15", "IPHONE-15-PRO"));
    }
}
