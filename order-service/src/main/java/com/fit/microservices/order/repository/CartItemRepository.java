package com.fit.microservices.order.repository;

import com.fit.microservices.order.model.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {

}
