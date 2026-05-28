import axiosClient from '../api/axiosClient';

// Use standard axiosClient configured with gateway port 9000, interceptors, and proper accessToken headers
const api = axiosClient;

export const adminService = {
  // ============ USER MANAGEMENT ============
  
  /**
   * Get all users (Admin only)
   */
  getAllUsers: async () => {
    try {
      const response = await api.get('/api/user');
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  /**
   * Get user by ID
   */
  getUserById: async (userId) => {
    try {
      const response = await api.get(`/api/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  },

  // ============ ORDER MANAGEMENT ============
  
  /**
   * Get all orders (Admin only)
   */
  getAllOrders: async () => {
    try {
      const response = await api.get('/api/order');
      return response.data;
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  },

  /**
   * Get order by ID
   */
  getOrderById: async (orderId) => {
    try {
      const response = await api.get(`/api/order/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  },

  /**
   * Update order status
   */
  updateOrderStatus: async (orderId, status) => {
    try {
      const response = await api.put(`/api/order/${orderId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  },

  // ============ DASHBOARD STATS ============
  
  /**
   * Get dashboard statistics
   * This is a computed function that aggregates data from various endpoints
   */
  getDashboardStats: async () => {
    try {
      // Fetch all necessary data in parallel
      const [usersResponse, ordersResponse] = await Promise.all([
        api.get('/api/user'),
        api.get('/api/order')
      ]);

      const users = usersResponse.data;
      const orders = ordersResponse.data;

      // Calculate statistics
      const totalRevenue = orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
      const totalOrders = orders.length;
      const activeUsers = users.filter(user => user.status === 'Active' || user.status === undefined || user.status === null).length;

      return {
        totalRevenue,
        totalOrders,
        activeUsers,
        users,
        orders
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }
};
