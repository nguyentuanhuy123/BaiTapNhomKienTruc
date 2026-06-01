package com.fit.microservices.produc.service.Impl;

import com.fit.microservices.produc.dto.ReviewReplyRequest;
import com.fit.microservices.produc.dto.ReviewReplyResponse;
import com.fit.microservices.produc.dto.ReviewRequest;
import com.fit.microservices.produc.dto.ReviewResponse;
import com.fit.microservices.produc.model.Review;
import com.fit.microservices.produc.model.ReviewReply;
import com.fit.microservices.produc.repository.ReviewReplyRepository;
import com.fit.microservices.produc.repository.ReviewRepository;
import com.fit.microservices.produc.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final ReviewReplyRepository reviewReplyRepository;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    @Override
    @Transactional
    public ReviewResponse addReview(ReviewRequest request) {
        Review review = Review.builder()
                .productId(request.getProductId())
                .name(request.getName())
                .title(request.getTitle())
                .content(request.getContent())
                .rating(request.getRating())
                .image(request.getImage())
                .verified(true)
                .build();

        Review savedReview = reviewRepository.save(review);
        return mapToReviewResponse(savedReview);
    }

    @Override
    public List<ReviewResponse> getReviewsByProduct(Long productId) {
        return reviewRepository.findByProductIdOrderByCreatedAtDesc(productId)
                .stream()
                .map(this::mapToReviewResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ReviewResponse> getAllReviews() {
        return reviewRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::mapToReviewResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ReviewResponse addAdminReply(Long reviewId, ReviewReplyRequest request) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found with id: " + reviewId));

        ReviewReply reply = ReviewReply.builder()
                .name(request.getName() != null ? request.getName() : "Global Admin")
                .content(request.getContent())
                .review(review)
                .build();

        reviewReplyRepository.save(reply);
        review.getReplies().add(reply);
        Review updatedReview = reviewRepository.save(review);
        return mapToReviewResponse(updatedReview);
    }

    @Override
    @Transactional
    public void deleteReview(Long id) {
        reviewRepository.deleteById(id);
    }

    private ReviewResponse mapToReviewResponse(Review review) {
        List<ReviewReplyResponse> replies = review.getReplies() != null ? review.getReplies().stream()
                .map(this::mapToReviewReplyResponse)
                .collect(Collectors.toList()) : java.util.Collections.emptyList();

        return new ReviewResponse(
                review.getId(),
                review.getProductId(),
                review.getName(),
                review.getTitle(),
                review.getContent(),
                review.getRating(),
                review.getVerified(),
                review.getImage(),
                formatDate(review.getCreatedAt()),
                replies
        );
    }

    private ReviewReplyResponse mapToReviewReplyResponse(ReviewReply reply) {
        return new ReviewReplyResponse(
                reply.getId(),
                reply.getName(),
                reply.getContent(),
                formatDate(reply.getCreatedAt())
        );
    }

    private String formatDate(LocalDateTime dateTime) {
        if (dateTime == null) return "";
        return dateTime.format(DATE_FORMATTER);
    }
}
