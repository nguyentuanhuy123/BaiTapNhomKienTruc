package com.fit.microservices.produc.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
@ToString
public class ImageResponse {
    private Long id;
    @NotBlank
    private String url;
}
