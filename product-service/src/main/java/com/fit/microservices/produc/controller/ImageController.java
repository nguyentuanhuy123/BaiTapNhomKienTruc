package com.fit.microservices.produc.controller;

import com.fit.microservices.produc.dto.ImageResponse;
import com.fit.microservices.produc.service.ImageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@Tag(name = "Image API", description = "Operations related to images")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/images")
public class ImageController {
    private final ImageService imageService;
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    @Operation(summary="Get list image by product ID")
    public List<ImageResponse> getImageByProductId(@PathVariable Long id) {
        return imageService.findAllByProductId(id);
    }
}
