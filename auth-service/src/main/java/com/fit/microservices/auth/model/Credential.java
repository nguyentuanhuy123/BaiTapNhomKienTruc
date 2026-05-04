package com.fit.microservices.auth.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "credentials")
@Getter
@Setter
public class Credential {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long userId;
    @Column(unique = true)
    private String email;
    private String password;
    private String role;
}