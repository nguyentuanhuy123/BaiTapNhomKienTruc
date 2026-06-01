package com.fit.microservices.produc.controller;

import com.fit.microservices.produc.dto.ReviewReplyRequest;
import com.fit.microservices.produc.dto.ReviewRequest;
import com.fit.microservices.produc.dto.ReviewResponse;
import com.fit.microservices.produc.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Review API", description = "Operations related to product reviews and comments")
@RestController
@RequestMapping("/api/comment")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @Operation(summary = "Add a product review")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ReviewResponse addReview(@RequestBody ReviewRequest request) {
        return reviewService.addReview(request);
    }

    @Operation(summary = "Get reviews for a specific product")
    @GetMapping("/product/{productId}")
    @ResponseStatus(HttpStatus.OK)
    public List<ReviewResponse> getReviewsByProduct(@PathVariable Long productId) {
        return reviewService.getReviewsByProduct(productId);
    }

    @Operation(summary = "Get all reviews")
    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    public List<ReviewResponse> getAllReviews() {
        return reviewService.getAllReviews();
    }

    @Operation(summary = "Add an admin reply to a review")
    @PostMapping("/{reviewId}/reply")
    @ResponseStatus(HttpStatus.OK)
    public ReviewResponse addAdminReply(@PathVariable Long reviewId, @RequestBody ReviewReplyRequest request) {
        return reviewService.addAdminReply(reviewId, request);
    }

    @Operation(summary = "Delete a review")
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteReview(@PathVariable Long id) {
        reviewService.deleteReview(id);
    }
}
