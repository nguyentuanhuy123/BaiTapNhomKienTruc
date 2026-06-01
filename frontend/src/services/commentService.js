import { notificationService } from './notificationService';
import axiosClient from '../api/axiosClient';

let listeners = [];

export const commentService = {
  subscribe(callback) {
    listeners.push(callback);
    return () => {
      listeners = listeners.filter(l => l !== callback);
    };
  },

  notify() {
    listeners.forEach(callback => callback());
  },

  async getReviewsByProduct(productId) {
    try {
      const response = await axiosClient.get(`/api/comment/product/${productId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching reviews for product ${productId}:`, error);
      return [];
    }
  },

  async getAllReviews() {
    try {
      const response = await axiosClient.get('/api/comment');
      return response.data;
    } catch (error) {
      console.error('Error fetching all reviews:', error);
      return [];
    }
  },

  async addReview(productId, name, title, content, rating, image = "") {
    try {
      const payload = {
        productId: parseInt(productId),
        name: name.toUpperCase(),
        title: title ? title.toUpperCase() : "",
        content,
        rating,
        image
      };

      const response = await axiosClient.post('/api/comment', payload);

      // Notify Admin of a new comment
      notificationService.addAdminNotification(
        'Bình luận mới từ khách hàng',
        `${name} đã đánh giá ${rating} sao cho sản phẩm ID: ${productId}.`,
        'new_comment'
      );

      this.notify();
      return response.data;
    } catch (error) {
      console.error('Error adding review:', error);
      throw error;
    }
  },

  async addAdminReply(reviewId, replyContent) {
    try {
      const payload = {
        name: "Global Admin",
        content: replyContent
      };

      const response = await axiosClient.post(`/api/comment/${reviewId}/reply`, payload);

      // Trigger Notification to the user that admin replied to their comment
      notificationService.addUserNotification(
        'Admin đã phản hồi bình luận của bạn',
        `Phản hồi: "${replyContent}"`,
        'admin_reply'
      );

      this.notify();
      return response.data;
    } catch (error) {
      console.error(`Error adding reply to review ${reviewId}:`, error);
      throw error;
    }
  },

  async deleteReview(reviewId) {
    try {
      await axiosClient.delete(`/api/comment/${reviewId}`);
      this.notify();
    } catch (error) {
      console.error(`Error deleting review ${reviewId}:`, error);
      throw error;
    }
  }
};
