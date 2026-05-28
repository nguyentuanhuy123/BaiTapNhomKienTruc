import axios from 'axios';
import axiosClient from './axiosClient';
// Thay đổi URL này thành URL thực tế của Backend (ví dụ lấy từ biến môi trường)
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:9000';
const AUTH_API_URL = `${BASE_URL}/api/auth`;

// Khởi tạo một axios instance riêng cho auth để dễ dàng cấu hình (interceptors, headers...)
const authClient = axios.create({
    baseURL: AUTH_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

const authApi = {
    /**
     * Gửi yêu cầu đăng nhập và nhận OTP.
     * @param {Object} data 
     * @param {string} data.email
     * @param {string} data.password
     * @param {string} [data.deviceId] - (Tùy chọn) ID thiết bị
     * @returns {Promise} Trả về chuỗi "OTP_SENT"
     */
    login: async (data) => {
        const deviceToken = localStorage.getItem('deviceToken');
        const response = await authClient.post('/login', {
            ...data,
            ...(deviceToken && { deviceToken }), // gửi nếu có
        });
        return response.data;
    },

    /**
     * Xác thực mã OTP và nhận Token.
     * @param {Object} data 
     * @param {string} data.email
     * @param {string} data.otp
     * @returns {Promise} Trả về đối tượng LoginResponse { accessToken, refreshToken, role, sessionId }
     */
    verifyOtp: async (data) => {
        const response = await authClient.post('/verify-otp', data);
        return response.data;
    },

    /**
     * Đăng ký tài khoản mới.
     * @param {Object} data 
     * @returns {Promise} Trả về thông báo thành công
     */
    register: async (data) => {
        const response = await authClient.post('/register', data);
        return response.data;
    },
    /**
     * Đăng nhập / đăng ký qua Google.
     * @param {string} idToken - Credential token từ @react-oauth/google onSuccess
     * @returns {Promise<LoginResponse>}
     */
    googleLogin: async (idToken) => {
        const response = await authClient.post('/google', { idToken });
        return response.data;
    },

    /**
     * Làm mới Access Token bằng Refresh Token.
     * @param {string} refreshToken 
     * @returns {Promise} Trả về LoginResponse mới { accessToken, refreshToken, role, sessionId }
     */
    refreshToken: async (refreshToken) => {
        const response = await authClient.post('/refresh', { refreshToken });
        return response.data;
    },

    /**
     * Đăng xuất khỏi phiên hiện tại (Xóa session trên Redis).
     * @param {string} refreshToken 
     * @returns {Promise}
     */
    logout: async (refreshToken) => {
        const response = await authClient.post('/logout', { refreshToken });
        return response.data;
    },

    /**
     * Đăng xuất khỏi TẤT CẢ các thiết bị.
     * @param {string} refreshToken 
     * @returns {Promise}
     */
    logoutAllDevices: async (refreshToken) => {
        const response = await authClient.post('/logout-all', { refreshToken });
        return response.data;
    },

    /**
     * Yêu cầu gửi email đặt lại mật khẩu.
     * @param {string} email 
     * @returns {Promise}
     */
    forgotPassword: async (email) => {
        const response = await authClient.post('/forgot-password', { email });
        return response.data;
    },

    /**
     * Đặt lại mật khẩu mới (dành cho luồng quên mật khẩu — không cần đăng nhập).
     * @param {Object} data 
     * @param {string} data.token - Token lấy từ link trong email
     * @param {string} data.newPassword
     * @returns {Promise}
     */
    resetPassword: async (data) => {
        const response = await authClient.post('/reset-password', data);
        return response.data;
    },

    /**
     * Đổi mật khẩu khi đã đăng nhập.
     * Yêu cầu: Bearer accessToken hợp lệ trong header Authorization.
     *
     * @param {Object} data
     * @param {string} data.currentPassword  - Mật khẩu hiện tại
     * @param {string} data.newPassword      - Mật khẩu mới (tối thiểu 8 ký tự)
     * @param {string} data.confirmPassword  - Xác nhận mật khẩu mới
     * @returns {Promise<string>} Thông báo thành công
     */
    changePassword: async (data) => {
        const response = await axiosClient.post('/api/auth/change-password', data);
        return response.data;
    }
};

export default authApi;
