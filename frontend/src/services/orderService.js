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

  updatePaymentMethod: async (orderId, paymentMethod) => {
    try {
      const response = await axiosClient.put(`/api/order/${orderId}/payment-method`, { paymentMethod });
      return response.data;
    } catch (error) {
      console.error('Lỗi khi cập nhật phương thức thanh toán:', error);
      throw error;
    }
  }
};
