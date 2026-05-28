package com.fit.microservices.inventory.service;

import com.fit.microservices.inventory.dto.InventoryResponse;

import java.util.List;

public interface InventoryService {
    List<InventoryResponse> isInStock(List<String> skuCode);
    void saveOrUpdate(com.fit.microservices.inventory.model.Inventory inventory);
}
