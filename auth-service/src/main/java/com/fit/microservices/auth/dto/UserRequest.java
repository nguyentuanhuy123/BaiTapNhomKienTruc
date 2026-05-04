package com.fit.microservices.auth.dto;

import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
@Builder
public class UserRequest {
    private String fullName;
    private String email;
    private String phone;
    private String address;
}
