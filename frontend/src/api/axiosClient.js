import axios from 'axios';
import authApi from './authApi';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:9000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Thêm Access Token vào Header
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Xử lý Refresh Token khi lỗi 401
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Nếu lỗi 401 và request chưa từng được thử lại
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error("No refresh token available");

        // Gọi API refresh token
        // Lưu ý: Dùng axios trực tiếp để tránh bị interceptor lặp vô hạn
        const res = await authApi.refreshToken(refreshToken);
        
        const { accessToken, refreshToken: newRefreshToken } = res;

        // Lưu mới vào storage
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        // Gán token mới vào request ban đầu và thực thi lại
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axiosClient(originalRequest);
      } catch (refreshError) {
        // Nếu refresh thất bại (hết hạn hoàn toàn), đăng xuất người dùng
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;