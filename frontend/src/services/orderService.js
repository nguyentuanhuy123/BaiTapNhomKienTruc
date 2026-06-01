import axiosClient from '../api/axiosClient';
import { notificationService } from './notificationService';

export const orderService = {
  createOrder: async (orderData) => {
    try {
      const response = await axiosClient.post('/api/order', orderData);
      
      try {
        notificationService.addAdminNotification(
          'Đơn hàng mới được tạo',
          `Đơn hàng #${response.data.orderId || response.data.id || 'đang xử lý'} vừa được tạo thành công bởi khách hàng "${orderData.userName || orderData.email || 'Ẩn danh'}".`,
          'order_created'
        );
      } catch (notifErr) {
        console.error('Lỗi khi gửi thông báo tạo đơn hàng cho admin:', notifErr);
      }

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
