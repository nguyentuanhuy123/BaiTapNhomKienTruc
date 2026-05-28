// src/api/paymentApi.js
// Payment service chạy ở port 8086 (gọi thẳng, không qua gateway)
const PAYMENT_BASE_URL = import.meta.env.VITE_PAYMENT_URL || 'http://localhost:8086';

const paymentApi = {
  /**
   * Khởi tạo thanh toán từ checkout.
   *
   * @param {Object} payload
   * @param {string} payload.paymentMethod  - "COD" | "VNPAY"
   * @param {number} payload.amount         - Tổng tiền (USD)
   * @param {string} payload.userEmail
   * @param {string} payload.userName
   * @param {string} payload.shippingAddress
   * @param {Array}  payload.items          - [{ name, quantity, price, size, color }]
   *
   * @returns {Promise<{ orderId, status, paymentUrl, message }>}
   *   - COD:   status="SUCCESS", paymentUrl=null
   *   - VNPay: status="PENDING", paymentUrl="https://sandbox.vnpayment.vn/..."
   */
  initiate: async (payload) => {
    const res = await fetch(`${PAYMENT_BASE_URL}/api/payment/initiate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `HTTP ${res.status}`);
    }

    return res.json();
  },
};

export default paymentApi;
