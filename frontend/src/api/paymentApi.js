// src/api/paymentApi.js

const PAYMENT_BASE_URL =
  import.meta.env.VITE_PAYMENT_URL || "http://localhost:9000";

const paymentApi = {
  initiate: async (payload) => {
    const token =
      localStorage.getItem("accessToken") ||
      localStorage.getItem("token") ||
      sessionStorage.getItem("accessToken");

    const res = await fetch(
      `${PAYMENT_BASE_URL}/api/payment/initiate`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && {
            Authorization: `Bearer ${token}`,
          }),
        },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `HTTP ${res.status}`);
    }

    return res.json();
  },

  /**
   * Lấy phương thức thanh toán thực tế của đơn hàng từ payment-service
   * @param {number|string} orderId 
   */
  getPaymentByOrderId: async (orderId) => {
    try {
      const res = await fetch(`${PAYMENT_BASE_URL}/api/payment/order/${orderId}`);
      if (!res.ok) return null;
      return await res.json(); // Trả về { method: "COD" | "VNPAY", status: "SUCCESS" | "FAILED" | "PENDING" }
    } catch (err) {
      console.error('Error fetching order payment method:', err);
      return null;
    }
  }
};

export default paymentApi;
