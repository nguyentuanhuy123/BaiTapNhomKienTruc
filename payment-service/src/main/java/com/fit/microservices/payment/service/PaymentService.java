package com.fit.microservices.payment.service;

import com.fit.microservices.payment.dto.PaymentResponse;
import com.fit.microservices.payment.event.InventoryReservedEvent;

import java.util.Map;

public interface PaymentService {
    PaymentResponse processPayment(InventoryReservedEvent event);
}
