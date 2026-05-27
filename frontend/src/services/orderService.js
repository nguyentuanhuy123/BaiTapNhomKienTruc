import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api', // Adjust base URL as needed
  withCredentials: true,
});

export const orderService = {
  createOrder: async (orderData) => {
    try {
      const response = await api.post('/order', orderData);
      return response.data; // Expecting { id: "123", status: "PENDING" } or similar
    } catch (error) {
      console.error('Lỗi khi tạo đơn hàng:', error);
      throw error;
    }
  },
  
  getOrder: async (id) => {
    try {
      const response = await api.get(`/order/${id}`);
      return response.data; // Expecting { id: "123", orderStatus: "AWAITING_PAYMENT" } or similar
    } catch (error) {
      console.error('Lỗi khi lấy thông tin đơn hàng:', error);
      throw error;
    }
  }
};

