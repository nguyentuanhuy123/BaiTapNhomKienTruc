import axiosClient from './axiosClient';

const userApi = {
  // Lấy thông tin user hiện tại
  getCurrentUser: async () => {
    const email = localStorage.getItem('userEmail');
    const response = await axiosClient.get('/api/user/me', {
      headers: { 'X-User-Email': email },
    });
    return response.data;
  },

  getUserById: async (id) => {
    const response = await axiosClient.get(`/api/user/${id}`);
    return response.data;
  },

  createUser: async (data) => {
    const response = await axiosClient.post('/api/user', data);
    return response.data;
  },

  /**
   * Cập nhật thông tin cá nhân (fullName, phone, address).
   * @param {{ fullName: string, phone: string, address: string }} data
   */
  updateProfile: async (data) => {
    const email = localStorage.getItem('userEmail');
    const response = await axiosClient.put('/api/user/me/profile', data, {
      headers: { 'X-User-Email': email },
    });
    return response.data;
  },

  /**
   * Upload avatar mới lên AWS S3 qua user-service.
   * @param {File} file - File ảnh được chọn từ input
   */
  updateAvatar: async (file) => {
    const email = localStorage.getItem('userEmail');
    const formData = new FormData();
    formData.append('file', file);

    const response = await axiosClient.patch('/api/user/me/avatar', formData, {
      headers: {
        'X-User-Email': email,
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  /**
   * Gửi OTP đến số điện thoại để xác minh.
   * @param {string} phone - Số điện thoại quốc tế, VD: "+84912345678"
   */
  sendPhoneOtp: async (phone) => {
    const email = localStorage.getItem('userEmail');
    const response = await axiosClient.post(
      '/api/user/me/phone/send-otp',
      { phone },
      { headers: { 'X-User-Email': email } }
    );
    return response.data;
  },

  /**
   * Xác minh OTP và lưu số điện thoại vào tài khoản.
   * @param {string} phone - Số điện thoại quốc tế
   * @param {string} otp   - Mã OTP 6 chữ số
   * @returns {Promise<UserResponse>} User đã cập nhật
   */
  verifyPhoneOtp: async (phone, otp) => {
    const email = localStorage.getItem('userEmail');
    const response = await axiosClient.post(
      '/api/user/me/phone/verify-otp',
      { phone, otp },
      { headers: { 'X-User-Email': email } }
    );
    return response.data;
  },

  /**
   * Fallback REST poll — dùng khi WebSocket chưa connect
   * hoặc cần kiểm tra trạng thái lần đầu (initial load).
   */
  checkOnlineStatus: async (id) => {
    const response = await axiosClient.get(`/api/user/${id}/online-status`);
    return response.data; // { userId, isOnline, status }
  },
};

export default userApi;
