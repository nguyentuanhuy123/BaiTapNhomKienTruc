package com.fit.microservices.produc.config;

public class Endpoints {
    //Permit all
    public static final String[] PUBLIC_GET_ENDPOINTS = {
            "/api/product/**",
            "/api/category/**"
    };
    public static final String[] PUBLIC_POST_ENDPOINTS = {

    };
    public static final String[] PUBLIC_DELETE_ENDPOINTS = {

    };
    public static final String[] PUBLIC_PUT_ENDPOINTS = {
    };

    //ADMIN
    public static final String[] ADMIN_GET_ENDPOINTS = {
            "/api/images/**",
    };
    public static final String[] ADMIN_POST_ENDPOINTS = {
            "/api/product/**",
            "/api/category/**"
    };
    public static final String[] ADMIN_DELETE_ENDPOINTS = {
            "/api/product/**",
            "/api/category/**"
    };
    public static final String[] ADMIN_PUT_ENDPOINTS = {
            "/api/product/**",
            "/api/category/**"
    };

}
