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
   * Fallback REST poll — dùng khi WebSocket chưa connect
   * hoặc cần kiểm tra trạng thái lần đầu (initial load).
   */
  checkOnlineStatus: async (id) => {
    const response = await axiosClient.get(`/api/user/${id}/online-status`);
    return response.data; // { userId, isOnline, status }
  },
};

export default userApi;
