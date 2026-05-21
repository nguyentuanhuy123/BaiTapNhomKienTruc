// frontend/src/services/cartService.js
import axiosClient from "../api/axiosClient";

const api = axiosClient;

export const cartService = {
    getCart: async () => {
        const res = await api.get("/api/cart");
        return res.data;
    },

    addItem: async ({ skuCode, productId, name, price, image, quantity, size, color }) => {
        const res = await api.post("/api/cart/items", { skuCode, productId, name, price, image, quantity, size, color });
        return res.data; // CartResponse
    },

    updateQuantity: async ({ itemId, quantity }) => {
        const res = await api.patch(`/api/cart/items/${itemId}`, { quantity });
        return res.data; // CartResponse
    },

    removeItem: async ({ itemId }) => {
        const res = await api.delete(`/api/cart/items/${itemId}`);
        return res.data; // CartResponse
    },

    clearCart: async () => {
        const res = await api.delete("/api/cart");
        return res.data; // CartResponse
    },
};
