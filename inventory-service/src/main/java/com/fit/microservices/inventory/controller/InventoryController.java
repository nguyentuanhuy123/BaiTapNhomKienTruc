package com.fit.microservices.inventory.controller;

import com.fit.microservices.inventory.dto.InventoryResponse;
import com.fit.microservices.inventory.service.InventoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@Tag(name = "Inventory API", description = "Operations related to inventories")
@RestController
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/api/inventory")
public class InventoryController {
    private final InventoryService inventoryService;
    @Operation(summary = "Check stock")
    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    public List<InventoryResponse> isInStock(@RequestParam List<String> skuCode) {
        log.info("Received inventory check request for skuCode: {}", skuCode);
        return inventoryService.isInStock(skuCode);
    }
}
