// frontend/src/services/cartService.js
import axios from "axios";

const API_BASE_URL = "http://localhost:9000/api";

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: { "Content-Type": "application/json" },
});

export const cartService = {
    getCart: async (userId) => {
        const res = await api.get("/cart", { params: { userId } });
        return res.data;
    },

    addItem: async ({ userId, skuCode, quantity, size, color }) => {
        const res = await api.post("/cart/items", { userId, skuCode, quantity, size, color });
        return res.data; // CartResponse
    },

    updateQuantity: async ({ userId, itemId, quantity }) => {
        const res = await api.patch(`/cart/items/${itemId}`, { quantity }, { params: { userId } });
        return res.data; // CartResponse
    },

    removeItem: async ({ userId, itemId }) => {
        const res = await api.delete(`/cart/items/${itemId}`, { params: { userId } });
        return res.data; // CartResponse
    },

    clearCart: async (userId) => {
        const res = await api.delete("/cart", { params: { userId } });
        return res.data; // CartResponse
    },
};
