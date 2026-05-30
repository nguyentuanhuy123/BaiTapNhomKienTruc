package com.fit.microservices.produc.service;

import com.fit.microservices.produc.dto.ReviewReplyRequest;
import com.fit.microservices.produc.dto.ReviewRequest;
import com.fit.microservices.produc.dto.ReviewResponse;

import java.util.List;

public interface ReviewService {
    ReviewResponse addReview(ReviewRequest request);
    List<ReviewResponse> getReviewsByProduct(Long productId);
    List<ReviewResponse> getAllReviews();
    ReviewResponse addAdminReply(Long reviewId, ReviewReplyRequest request);
}
