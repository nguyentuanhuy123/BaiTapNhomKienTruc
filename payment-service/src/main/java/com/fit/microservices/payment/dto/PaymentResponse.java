package com.fit.microservices.payment.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class PaymentResponse {
    private Long orderId;
    private String status;      // "PENDING" | "SUCCESS" | "FAILED"
    private String paymentUrl;  // null nếu COD
    private String message;
}
