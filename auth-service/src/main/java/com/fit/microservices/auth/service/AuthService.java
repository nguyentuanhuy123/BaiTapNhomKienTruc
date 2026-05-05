package com.fit.microservices.auth.service;

import com.fit.microservices.auth.dto.*;

public interface AuthService {
    String login(LoginRequest request);
    LoginResponse verifyOtp(OtpVerificationRequest request);
    LoginResponse refreshToken(RefreshTokenRequest request);
    void logout(RefreshTokenRequest request);
    void register(RegisterRequest registerRequest);
    void logoutAllDevices(RefreshTokenRequest request);
    void forgotPassword(ForgotPasswordRequest request);
    void resetPassword(ResetPasswordRequest request);
}