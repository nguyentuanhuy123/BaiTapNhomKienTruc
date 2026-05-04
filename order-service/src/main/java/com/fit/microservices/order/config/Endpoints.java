package com.fit.microservices.order.config;

public class Endpoints {

    public static final String[] USER_GET_ENDPOINTS = {

    };
    public static final String[] PUBLIC_DELETE_ENDPOINTS = {
            "/api/order/**",
            "/api/cart/**"
    };
    public static final String[] USER_POST_ENDPOINTS = {
            "/api/order/**",
            "/api/cart/**"
    };
    public static final String[] ADMIN_GET_ENDPOINTS = {
            "/api/order/**",
    };

    public static final String[] ADMIN_PUT_ENDPOINTS = {
            "/api/order/**",
    };
}
