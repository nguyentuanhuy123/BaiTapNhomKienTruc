package com.fit.microservices.produc.repository;

import com.fit.microservices.produc.model.ReviewReply;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReviewReplyRepository extends JpaRepository<ReviewReply, Long> {
}
