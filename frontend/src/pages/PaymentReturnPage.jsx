import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

/**
 * Trang kết quả sau khi VNPay redirect về.
 * Backend xử lý callback → redirect đến đây với query params:
 *   ?status=success&orderId=10001&amount=246.24
 *   ?status=failed&orderId=10001&reason=09
 */
const PaymentReturnPage = () => {
  const [searchParams] = useSearchParams();
  const [countdown, setCountdown] = useState(10);

  const status  = searchParams.get('status');   // "success" | "failed"
  const orderId = searchParams.get('orderId');
  const amount  = searchParams.get('amount');
  const reason  = searchParams.get('reason');

  const isSuccess = status === 'success';

  // Auto-redirect về trang chủ sau 10s khi thành công
  useEffect(() => {
    if (!isSuccess) return;
    if (countdown === 0) {
      window.location.href = '/explore';
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [isSuccess, countdown]);

  const errorMessages = {
    '07': 'Giao dịch bị nghi ngờ gian lận.',
    '09': 'Thẻ/Tài khoản chưa đăng ký dịch vụ.',
    '10': 'Xác thực thông tin không đúng quá 3 lần.',
    '11': 'Đã hết hạn chờ thanh toán.',
    '12': 'Thẻ/Tài khoản bị khóa.',
    '24': 'Bạn đã hủy giao dịch.',
    '51': 'Tài khoản không đủ số dư.',
    '65': 'Đã vượt quá hạn mức giao dịch trong ngày.',
    '75': 'Ngân hàng thanh toán đang bảo trì.',
    not_found: 'Không tìm thấy đơn thanh toán.',
  };

  const errorMsg = reason
    ? errorMessages[reason] || `Lỗi thanh toán (mã: ${reason})`
    : 'Thanh toán không thành công.';

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-lg w-full">

          {isSuccess ? (
            <>
              {/* Success */}
              <div className="w-28 h-28 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
                <span className="material-symbols-outlined text-6xl">check_circle</span>
              </div>

              <h1 className="text-4xl font-space-grotesk font-black text-zinc-900 mb-4 uppercase italic">
                Thanh toán thành công!
              </h1>

              <div className="bg-zinc-50 rounded-3xl p-6 mb-8 text-left space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400 font-semibold uppercase tracking-wider text-xs">Mã đơn hàng</span>
                  <span className="font-bold text-zinc-900">#{orderId || '—'}</span>
                </div>
                {amount && (
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400 font-semibold uppercase tracking-wider text-xs">Số tiền</span>
                    <span className="font-bold text-zinc-900">${parseFloat(amount).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400 font-semibold uppercase tracking-wider text-xs">Phương thức</span>
                  <span className="font-bold text-purple-600">VNPay</span>
                </div>
              </div>

              <p className="text-zinc-400 text-sm mb-8">
                📧 Email xác nhận đã được gửi đến địa chỉ của bạn.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/orders">
                  <button className="bg-zinc-900 text-white px-8 py-4 rounded-2xl font-bold hover:scale-105 transition-all shadow-lg">
                    Xem đơn hàng
                  </button>
                </Link>
                <Link to="/explore">
                  <button className="bg-zinc-100 text-zinc-700 px-8 py-4 rounded-2xl font-bold hover:bg-zinc-200 transition-all">
                    Tiếp tục mua sắm
                  </button>
                </Link>
              </div>

              <p className="text-zinc-300 text-xs mt-8">
                Tự động chuyển hướng sau {countdown}s...
              </p>
            </>
          ) : (
            <>
              {/* Failed */}
              <div className="w-28 h-28 bg-red-50 text-red-400 rounded-full flex items-center justify-center mx-auto mb-8">
                <span className="material-symbols-outlined text-6xl">cancel</span>
              </div>

              <h1 className="text-4xl font-space-grotesk font-black text-zinc-900 mb-4 uppercase italic">
                Thanh toán thất bại
              </h1>

              <div className="bg-red-50 border border-red-100 rounded-3xl p-6 mb-8">
                <p className="text-red-600 font-medium text-sm">{errorMsg}</p>
                {orderId && (
                  <p className="text-red-400 text-xs mt-2">Mã đơn hàng: #{orderId}</p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/checkout">
                  <button className="bg-primary-container text-white px-8 py-4 rounded-2xl font-bold hover:scale-105 transition-all shadow-lg">
                    Thử lại
                  </button>
                </Link>
                <Link to="/cart">
                  <button className="bg-zinc-100 text-zinc-700 px-8 py-4 rounded-2xl font-bold hover:bg-zinc-200 transition-all">
                    Về giỏ hàng
                  </button>
                </Link>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PaymentReturnPage;
