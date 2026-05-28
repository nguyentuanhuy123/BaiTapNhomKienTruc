package com.fit.microservices.auth.controller;

import com.fit.microservices.auth.dto.*;
import com.fit.microservices.auth.service.AuthService;
import com.fit.microservices.auth.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final JwtUtil jwtUtil;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest
    ) {
        request.setIpAddress(getClientIp(httpRequest));
        request.setDeviceName(httpRequest.getHeader("User-Agent"));
        LoginResponse result = authService.login(request);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<LoginResponse> verifyOtp(@Valid @RequestBody OtpVerificationRequest request) {
        return ResponseEntity.ok(authService.verifyOtp(request));
    }

    @PostMapping("/refresh")
    public ResponseEntity<LoginResponse> refresh(@RequestBody RefreshTokenRequest request) {
        return ResponseEntity.ok(authService.refreshToken(request));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestBody RefreshTokenRequest request) {
        authService.logout(request);
        return ResponseEntity.ok("Logout success");
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        authService.register(request);
        return ResponseEntity.ok("Register success");
    }

    @PostMapping("/logout-all")
    public ResponseEntity<?> logoutAllDevices(@RequestBody RefreshTokenRequest request) {
        authService.logoutAllDevices(request);
        return ResponseEntity.ok("Logout all devices success");
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        return ResponseEntity.ok("Nếu email hợp lệ, hướng dẫn đặt lại mật khẩu sẽ được gửi.");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok("Đặt lại mật khẩu thành công");
    }

    /**
     * Endpoint này yêu cầu JWT hợp lệ (đã khai báo .authenticated() trong SecurityConfig).
     * Spring Security sẽ từ chối (401/403) TRƯỚC KHI vào đây nếu token không hợp lệ.
     */
    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(
            @Valid @RequestBody ChangePasswordRequest request
    ) {
        // Lấy email từ SecurityContext — đã được JwtAuthenticationFilter set sẵn
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        // Lấy sessionId từ token (để giữ session hiện tại sau khi đổi mật khẩu)
        String sessionId = null;
        try {
            HttpServletRequest httpRequest =
                    ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes()).getRequest();
            String authHeader = httpRequest.getHeader("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                sessionId = jwtUtil.extractSessionId(authHeader.substring(7));
            }
        } catch (Exception e) {
            // Token hết hạn hoặc lỗi parse — không cần sessionId, vẫn cho đổi mật khẩu
        }

        request.setCurrentSessionId(sessionId);
        authService.changePassword(email, request);
        return ResponseEntity.ok("Đổi mật khẩu thành công");
    }

    @PostMapping("/google")
    public ResponseEntity<LoginResponse> googleLogin(@Valid @RequestBody GoogleLoginRequest request) {
        return ResponseEntity.ok(authService.googleLogin(request));
    }

    private String getClientIp(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader != null && !xfHeader.isBlank()) {
            return xfHeader.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
