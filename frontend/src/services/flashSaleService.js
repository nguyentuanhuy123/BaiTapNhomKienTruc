import axios from 'axios';

const API_BASE_URL = 'http://localhost:9000/api/v1/flashsale'; // Định tuyến qua API Gateway cổng 9000

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Tự động đính kèm JWT token từ localStorage (nếu có)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const flashSaleService = {
  /**
   * Tạo/Lên lịch chiến dịch Flash Sale mới (Chỉ dành cho Admin)
   */
  createCampaign: async (campaignData) => {
    const response = await api.post('/command/campaign/create', campaignData);
    return response.data;
  },

  /**
   * Lấy danh sách tất cả các chiến dịch Flash Sale (Chỉ dành cho Admin)
   */
  getAllCampaigns: async () => {
    const response = await api.get('/query/campaign/all');
    return response.data;
  },

  /**
   * Lấy chiến dịch Flash Sale đang hoạt động (Dành cho khách hàng)
   */
  getActiveCampaign: async () => {
    const response = await api.get('/query/campaign/active');
    return response.data;
  },

  /**
   * Khởi tạo số lượng tồn kho trong Virtual Space (Chỉ dành cho Admin/Test)
   */
  initStock: async (productId, quantity) => {
    const response = await api.post(`/command/init-stock?productId=${productId}&quantity=${quantity}`);
    return response.data;
  },

  /**
   * Cập nhật thời gian chiến dịch Flash Sale (Chỉ dành cho Admin)
   */
  setCampaignTime: async (durationMinutes) => {
    const response = await api.post(`/command/set-campaign-time?durationMinutes=${durationMinutes}`);
    return response.data;
  },

  /**
   * Lấy số tồn kho real-time từ RAM (CQRS Query Side)
   */
  getRealtimeStock: async (productId) => {
    const response = await api.get(`/query/stock/${productId}`);
    return response.data;
  },

  /**
   * Lấy thời gian kết thúc đợt Flash Sale đang diễn ra (CQRS Query Side)
   */
  getCampaignTime: async () => {
    const response = await api.get('/query/campaign-time');
    return response.data;
  },

  /**
   * Lệnh Giật Deal siêu tốc (CQRS Command Side)
   */
  checkoutFlashSale: async (productId, userId, quantity = 1) => {
    const response = await api.post('/command/checkout', {
      productId,
      userId,
      quantity
    });
    return response.data; // Trả về thông tin Order dạng PENDING từ Kafka
  }
};
