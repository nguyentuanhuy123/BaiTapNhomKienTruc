import axios from 'axios';

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
        const response = await authClient.post('/login', data);
        return response.data;
    },

    /**
     * Xác thực mã OTP và nhận Token.
     * @param {Object} data 
     * @param {string} data.email
     * @param {string} data.otp
     * @param {string} [data.deviceId] - (Tùy chọn) ID thiết bị
     * @param {string} [data.deviceName] - (Tùy chọn) Tên thiết bị
     * @returns {Promise} Trả về đối tượng LoginResponse { accessToken, refreshToken, role, sessionId }
     */
    verifyOtp: async (data) => {
        const response = await authClient.post('/verify-otp', data);
        return response.data;
    },

    /**
     * Đăng ký tài khoản mới.
     * @param {Object} data 
     * @param {string} data.fullName
     * @param {string} data.email
     * @param {string} data.password
     * @param {string} data.phone
     * @param {string} data.address
     * @returns {Promise} Trả về thông báo thành công
     */
    register: async (data) => {
        const response = await authClient.post('/register', data);
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
     * Đặt lại mật khẩu mới.
     * @param {Object} data 
     * @param {string} data.token - Token lấy từ link trong email
     * @param {string} data.newPassword
     * @returns {Promise}
     */
    resetPassword: async (data) => {
        const response = await authClient.post('/reset-password', data);
        return response.data;
    }
};

export default authApi;