package com.fit.microservices.payment.dto;



import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class PaymentResponse {
    private Long orderId;
    private String paymentUrl;
}
