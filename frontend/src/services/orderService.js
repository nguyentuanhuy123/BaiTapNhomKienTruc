import axiosClient from '../api/axiosClient';

export const orderService = {
  createOrder: async (orderData) => {
    try {
      const response = await axiosClient.post('/api/order', orderData);
      return response.data; // Expecting { orderId: "123", orderStatus: "PENDING" } or similar
    } catch (error) {
      console.error('Lỗi khi tạo đơn hàng:', error);
      throw error;
    }
  },
  
  getOrder: async (id) => {
    try {
      const response = await axiosClient.get(`/api/order/${id}`);
      return response.data; // Expecting { orderId: "123", orderStatus: "AWAITING_PAYMENT" } or similar
    } catch (error) {
      console.error('Lỗi khi lấy thông tin đơn hàng:', error);
      throw error;
    }
  },

  getMyOrders: async () => {
    try {
      const response = await axiosClient.get(`/api/order/my-orders`);
      return response.data; 
    } catch (error) {
      console.error('Lỗi khi lấy danh sách đơn hàng của tôi:', error);
      throw error;
    }
  }
};
