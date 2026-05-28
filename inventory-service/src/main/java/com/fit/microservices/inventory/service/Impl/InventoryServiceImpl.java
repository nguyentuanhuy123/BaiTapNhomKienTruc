package com.fit.microservices.inventory.service.Impl;

import com.fit.microservices.inventory.dto.InventoryResponse;
import com.fit.microservices.inventory.repository.InventoryRepository;
import com.fit.microservices.inventory.service.InventoryService;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class InventoryServiceImpl implements InventoryService {
    private final InventoryRepository inventoryRepository;

    @Override
    @Transactional(readOnly = true)
    @SneakyThrows
    public List<InventoryResponse> isInStock(List<String> skuCode) {
        log.info("Checking Inventory");
        return inventoryRepository.findBySkuCodeIn(skuCode).stream()
                .map(inventory ->
                        InventoryResponse.builder()
                                .skuCode(inventory.getSkuCode())
                                .isInStock(inventory.getQuantity() > 0)
                                .quantity(inventory.getQuantity())
                                .build()
                ).toList();
    }

    @Override
    @Transactional
    public void saveOrUpdate(com.fit.microservices.inventory.model.Inventory inventory) {
        log.info("Saving or updating stock for SKU: {}", inventory.getSkuCode());
        com.fit.microservices.inventory.model.Inventory existing = inventoryRepository.findBySkuCodeIn(List.of(inventory.getSkuCode()))
                .stream().findFirst().orElse(null);
        if (existing != null) {
            existing.setQuantity(inventory.getQuantity());
            inventoryRepository.save(existing);
        } else {
            inventoryRepository.save(inventory);
        }
    }
}
