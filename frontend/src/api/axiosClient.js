// src/api/axiosClient.js
import axios from 'axios';
import authApi from './authApi';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:9000',
  headers: { 'Content-Type': 'application/json' },
});

// ── Request Interceptor ──────────────────────────────────────────────────────
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Helper: xóa storage và chuyển về login ───────────────────────────────────
function forceLogout(reason = '') {
  localStorage.clear();
  // Dùng window.location thay vì navigate() vì đây ngoài React component
  window.location.href = `/login${reason ? `?reason=${reason}` : ''}`;
}

// ── Response Interceptor ─────────────────────────────────────────────────────
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const errMsg = error.response?.data?.error;

    // ✅ Check SESSION_REVOKED TRƯỚC TIÊN — không retry gì cả
    if (status === 401 && errMsg === 'SESSION_REVOKED') {
      localStorage.clear();
      window.dispatchEvent(new Event('force-logout')); // thông báo AuthContext
      window.location.href = '/login?reason=session_revoked';
      return Promise.reject(error);
    }

    // Sau đó mới xử lý 401 thông thường → refresh token
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');

        const res = await authApi.refreshToken(refreshToken);
        const { accessToken, refreshToken: newRefreshToken } = res;

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axiosClient(originalRequest);
      } catch (refreshError) {
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;