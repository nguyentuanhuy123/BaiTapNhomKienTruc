package com.fit.microservices.inventory.service;

import com.fit.microservices.inventory.dto.InventoryResponse;

import java.util.List;

public interface InventoryService {
    List<InventoryResponse> isInStock(List<String> skuCode);
}
