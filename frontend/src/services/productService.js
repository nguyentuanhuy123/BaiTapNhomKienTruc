import axios from 'axios';

const API_BASE_URL = 'http://localhost:9000/api'; // Sử dụng Gateway cổng 9000

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const productService = {
  getAllProducts: async (page = 0, size = 6, category = '', brand = '', color = '') => {
    try {
      const response = await api.get('/product', {
        params: { page, size, category, brand, color }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },
  
  getProductById: async (id) => {
    try {
      const response = await api.get(`/product/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching product ${id}:`, error);
      throw error;
    }
  },
  getAllCategories: async () => {
    try {
      const response = await api.get('/category');
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  // ============ ADMIN PRODUCT MANAGEMENT ============
  createProduct: async (productData) => {
    try {
      const response = await api.post('/product', productData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  updateProduct: async (productId, productData) => {
    try {
      const response = await api.put(`/product/${productId}`, productData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating product ${productId}:`, error);
      throw error;
    }
  },

  deleteProduct: async (productId) => {
    try {
      const response = await api.delete(`/product/${productId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error deleting product ${productId}:`, error);
      throw error;
    }
  },

  // ============ ADMIN CATEGORY MANAGEMENT ============
  createCategory: async (categoryData) => {
    try {
      const response = await api.post('/category', categoryData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  },

  updateCategory: async (categoryId, categoryData) => {
    try {
      const response = await api.put(`/category/${categoryId}`, categoryData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating category ${categoryId}:`, error);
      throw error;
    }
  },

  deleteCategory: async (categoryId) => {
    try {
      const response = await api.delete(`/category/${categoryId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error deleting category ${categoryId}:`, error);
      throw error;
    }
  },

  getFlashSaleProducts: async (page = 0, size = 6) => {
    try {
      const response = await api.get('/product/flash-sale', {
        params: { page, size }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching flash sale products:', error);
      throw error;
    }
  },

  // Comment methods
  getCommentsByProduct: async (productId) => {
    try {
      const response = await api.get(`/comment/product/${productId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching comments for product ${productId}:`, error);
      throw error;
    }
  },

  addComment: async (commentData) => {
    try {
      const response = await api.post('/comment', commentData);
      return response.data;
    } catch (error) {
      console.error(`Error adding comment:`, error);
      throw error;
    }
  },

  // Wishlist methods
  toggleWishlist: async (username, productId) => {
    try {
      await api.post(`/wishlist/${productId}`, null, {
        params: { username },
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
    } catch (error) {
      console.error(`Error toggling wishlist for product ${productId}:`, error);
      throw error;
    }
  },

  getWishlist: async (username) => {
    try {
      const response = await api.get('/wishlist', {
        params: { username },
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      throw error;
    }
  },

  isInWishlist: async (username, productId) => {
    try {
      const response = await api.get(`/wishlist/check/${productId}`, {
        params: { username },
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error checking wishlist for product ${productId}:`, error);
      throw error;
    }
  },

  checkPurchase: async (skuCode) => {
    try {
      const response = await api.get('/order/has-purchased', {
        params: { skuCode },
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error checking purchase:', error);
      return false;
    }
  }
};

export default api;
