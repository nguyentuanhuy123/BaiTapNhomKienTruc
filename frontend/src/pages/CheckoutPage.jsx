import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { useAuth } from '../contexts/AuthContext';
import { useUserStatusContext } from '../contexts/UserStatusContext';
import { cartService } from '../services/cartService';
import { orderService } from '../services/orderService';
import paymentApi from '../api/paymentApi';
import userApi from '../api/userApi';
import { flashSaleService } from '../services/flashSaleService';

const parseAddress = (raw) => {
  if (!raw) return { street: '', ward: '', district: '', city: '' };
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') return {
      street: parsed.street || '',
      ward: parsed.ward || '',
      district: parsed.district || '',
      city: parsed.city || '',
    };
  } catch (_) {}
  return { street: raw, ward: '', district: '', city: '' };
};

const CheckoutPage = () => {
  const { user } = useAuth();
  const { sendAdminNotification } = useUserStatusContext();
  const location = useLocation();
  const directItem = location.state?.directItem;

  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState(null);
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    firstName: '',
    lastName: '',
    street: '',
    ward: '',
    district: '',
    city: '',
  });

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Tỷ giá quy đổi từ USD sang VND (có thể điều chỉnh theo thực tế)
  const EXCHANGE_RATE = 25400;

  const handleAddressChange = (key) => (event) => {
    setShippingAddress((prev) => ({ ...prev, [key]: event.target.value }));
  };

  // Fetch cart
  useEffect(() => {
    let isMounted = true;
    const fetchCart = async () => {
      try {
        setError('');
        setLoading(true);
        if (directItem) {
          // Bỏ qua giỏ hàng, nạp trực tiếp sản phẩm Mua Ngay
          const items = [{
            id: directItem.id,
            productId: directItem.productId || directItem.id,
            name: directItem.name || directItem.skuCode,
            skuCode: directItem.skuCode,
            size: directItem.size || 'N/A',
            color: directItem.color || 'Default',
            qty: directItem.qty ?? 1,
            price: directItem.price || 0,
            image: directItem.image || 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/480px-No_image_available.svg.png',
          }];
          if (isMounted) setCartItems(items);
        } else {
          // Nạp giỏ hàng thông thường từ server
          const data = await cartService.getCart();
          const items = (data?.items || []).map((it) => ({
            id: it.id,
            productId: it.productId || it.id,
            name: it.name || it.skuCode,
            skuCode: it.skuCode,
            size: it.size || 'N/A',
            color: it.color || 'Default',
            qty: it.quantity ?? 0,
            price: it.price || 0,
            image: it.image || 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/480px-No_image_available.svg.png',
          }));
          if (isMounted) setCartItems(items);
        }
      } catch (error) {
        console.error(error);
        if (isMounted) setError('Failed to load checkout details. Please try again.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchCart();
    return () => { isMounted = false; };
  }, [directItem]);

  // Fetch user profile và tự điền địa chỉ
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await userApi.getCurrentUser();
        if (data) {
          const parts = (data.fullName || '').trim().split(' ');
          const lastName = parts.length > 1 ? parts.slice(-1)[0] : '';
          const firstName = parts.length > 1 ? parts.slice(0, -1).join(' ') : parts[0] || '';
          const addr = parseAddress(data.address);
          setShippingAddress({
            firstName,
            lastName,
            street: addr.street || '',
            ward: addr.ward || '',
            district: addr.district || '',
            city: addr.city || '',
          });
        }
      } catch (err) {
        console.error('Không thể tải thông tin người dùng', err);
      }
    };
    fetchUser();
  }, []);

  const subtotal = useMemo(
    () => cartItems.reduce((acc, item) => acc + item.price * item.qty, 0),
    [cartItems]
  );
  const shipping = cartItems.length > 0 ? (shippingMethod === 'priority' ? 5 : 2) : 0;
  const estimatedTax = cartItems.length > 0 ? 10 : 0;
  const total = subtotal + shipping + estimatedTax;

  // Build full address string for display & API
  const fullAddressString = [
    shippingAddress.street,
    shippingAddress.ward,
    shippingAddress.district,
    shippingAddress.city,
  ].filter(Boolean).join(', ');

  const generateOrderDraft = () => {
    return {
      orderLineItemsDtoList: cartItems.map((it) => ({
        productId: it.productId,
        skuCode: it.skuCode || it.name,
        color: it.color,
        size: it.size,
        quantity: it.qty,
      })),
      shippingMethod,
      shippingFirstName: shippingAddress.firstName,
      shippingLastName: shippingAddress.lastName,
      shippingStreet: shippingAddress.street,
      shippingWard: shippingAddress.ward,
      shippingDistrict: shippingAddress.district,
      shippingCity: shippingAddress.city,
      paymentMethod,
    };
  };

  const handleContinueToPayment = async () => {
    try {
      setError('');
      setIsProcessingOrder(true);

      const isFlashSale = directItem?.isFlashSale;
      if (isFlashSale) {
        // Luồng Checkout Flash Sale siêu tốc trên RAM Hazelcast + Kafka
        const productId = directItem.skuCode || directItem.name;
        const userId = String(user?.id || localStorage.getItem('userId') || '2');
        const qty = directItem.qty || 1;

        const response = await flashSaleService.checkoutFlashSale(productId, userId, qty);
        // Trả về: successEvent = { orderId, productId, userId, quantity, price, status }
        const orderId = response?.orderId || response;
        setCurrentOrderId(orderId);
        pollOrderStatus(orderId);
      } else {
        // Luồng mua hàng thông thường
        const payload = generateOrderDraft();
        const response = await orderService.createOrder(payload);
        const orderId = response?.orderId || response?.id || response;
        setCurrentOrderId(orderId);
        pollOrderStatus(orderId);
      }
    } catch (err) {
      console.error(err);
      setError('Đã xảy ra lỗi khi tạo đơn hàng. Vui lòng thử lại.');
      setIsProcessingOrder(false);
    }
  };

  const pollOrderStatus = (orderId) => {
    const maxRetries = 20;
    let retries = 0;
    const intervalId = setInterval(async () => {
      try {
        const orderData = await orderService.getOrder(orderId);
        const status = orderData.orderStatus || orderData.status;
        if (status === 'AWAITING_PAYMENT') {
          clearInterval(intervalId);
          setIsProcessingOrder(false);
          if (orderData.id) {
            setCurrentOrderId(orderData.id);
          }
          setStep(2);
        } else if (status === 'CANCELLED') {
          clearInterval(intervalId);
          setIsProcessingOrder(false);
          setError('Xin lỗi, sản phẩm không đủ số lượng trong kho.');
        }
        retries++;
        if (retries >= maxRetries) {
          clearInterval(intervalId);
          setIsProcessingOrder(false);
          setError('Quá thời gian chờ phản hồi. Vui lòng kiểm tra lại đơn hàng sau.');
        }
      } catch (err) {
        console.error('Lỗi khi poll API:', err);
      }
    }, 3000);
  };

  const handlePlaceOrder = async () => {
    setError('');
    setLoading(true);
    const fullName = `${shippingAddress.firstName} ${shippingAddress.lastName}`.trim();
    
    // TÍNH TOÁN QUY ĐỔI SANG VND NẾU LÀ VNPAY
    const finalAmount = paymentMethod === 'vnpay' ? Math.round(total * EXCHANGE_RATE) : total;

    const payload = {
      orderId: currentOrderId,
      paymentMethod: paymentMethod.toUpperCase(),
      amount: finalAmount, 
      userEmail: user?.email || '',
      userName: fullName || 'Khách hàng',
      shippingAddress: fullAddressString || '123 Performance Way',
      items: cartItems.map((item) => ({
        name: item.name,
        quantity: item.qty,
        price: item.price,
        size: item.size,
        color: item.color,
      })),
    };

    try {
      const result = await paymentApi.initiate(payload);
      if (paymentMethod === 'vnpay' && result.paymentUrl) {
        window.location.href = result.paymentUrl;
        return;
      }
      sendAdminNotification(
        'Đặt hàng',
        `Khách hàng ${user?.email || 'khách'} đã đặt hàng thành công. Phương thức: COD. Tổng tiền: $${total.toFixed(2)}.`,
        'order'
      );
      setOrderPlaced(true);
    } catch (err) {
      console.error(err);
      setError('Đặt hàng thất bại: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Order confirmed screen ────────────────────────────────────────────
  if (orderPlaced) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-8">
          <div className="text-center max-w-lg">
            <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
              <span className="material-symbols-outlined text-5xl font-black">check</span>
            </div>
            <h1 className="text-4xl font-space-grotesk font-black text-zinc-900 mb-4 uppercase italic">
              Order Confirmed!
            </h1>
            <p className="text-zinc-500 mb-4 leading-relaxed">
              Đơn hàng{' '}
              <span className="text-zinc-900 font-bold">#{currentOrderId || 'VT-99281'}</span>{' '}
              đã được đặt thành công.
            </p>
            {user?.email && (
              <p className="text-zinc-400 text-sm mb-10">
                📧 Email xác nhận đã được gửi đến{' '}
                <span className="font-semibold text-zinc-600">{user?.email}</span>
              </p>
            )}
            <Link to="/explore">
              <button className="bg-zinc-900 text-white px-10 py-4 rounded-full font-bold hover:scale-105 transition-all shadow-xl">
                Continue Shopping
              </button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ── Main checkout ─────────────────────────────────────────────────────
  return (
    <div className="flex flex-col min-h-screen bg-zinc-50/50">
      <Navbar />

      <main className="flex-1 pt-24 pb-20 px-margin-mobile md:px-margin-desktop max-w-[1200px] mx-auto w-full">
        {/* Stepper */}
        <div className="flex justify-center items-center gap-4 md:gap-8 mb-16">
          {[
            { n: 1, label: 'Shipping' },
            { n: 2, label: 'Payment' },
            { n: 3, label: 'Review' },
          ].map(({ n, label }, idx, arr) => (
            <React.Fragment key={n}>
              <div className={`flex items-center gap-3 transition-opacity ${step >= n ? 'opacity-100' : 'opacity-40'}`}>
                <span
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                    ${step >= n ? 'bg-primary-container text-white' : 'bg-zinc-200 text-zinc-600'}`}
                >
                  {n}
                </span>
                <span className="text-zinc-900 font-bold text-sm">{label}</span>
              </div>
              {idx < arr.length - 1 && (
                <div className={`w-12 h-[2px] ${step > n ? 'bg-primary-container' : 'bg-zinc-200'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Main Content */}
          <div className="flex-1 space-y-10">
            {error && (
              <div className="rounded-2xl bg-red-50 px-6 py-4 text-sm text-red-700">{error}</div>
            )}

            {/* Loading Overlay */}
            {isProcessingOrder && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
                <div className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center max-w-sm w-full mx-4">
                  <div className="w-16 h-16 border-4 border-zinc-200 border-t-primary-container rounded-full animate-spin mb-6"></div>
                  <h3 className="text-xl font-bold text-zinc-900 mb-2">Processing...</h3>
                  <p className="text-zinc-500 text-center text-sm">Đang kiểm tra tồn kho. Vui lòng không đóng trang này.</p>
                </div>
              </div>
            )}

            {/* ── Step 1: Shipping ── */}
            {step === 1 && (
              <>
                <section className="bg-white rounded-[32px] p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-primary-container">
                      <span className="material-symbols-outlined">local_shipping</span>
                    </div>
                    <h2 className="text-2xl font-bold text-zinc-900 uppercase tracking-tight">
                      Shipping Address
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* First Name */}
                    <div className="space-y-2">
                      <label className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">First Name</label>
                      <input
                        type="text"
                        placeholder="John"
                        value={shippingAddress.firstName}
                        onChange={handleAddressChange('firstName')}
                        className="w-full bg-zinc-50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-primary-container/20 transition-all"
                      />
                    </div>
                    {/* Last Name */}
                    <div className="space-y-2">
                      <label className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">Last Name</label>
                      <input
                        type="text"
                        placeholder="Doe"
                        value={shippingAddress.lastName}
                        onChange={handleAddressChange('lastName')}
                        className="w-full bg-zinc-50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-primary-container/20 transition-all"
                      />
                    </div>
                    {/* Street Address */}
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">Số nhà / Tên đường</label>
                      <input
                        type="text"
                        placeholder="123 Nguyễn Huệ"
                        value={shippingAddress.street}
                        onChange={handleAddressChange('street')}
                        className="w-full bg-zinc-50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-primary-container/20 transition-all"
                      />
                    </div>
                    {/* Ward */}
                    <div className="space-y-2">
                      <label className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">Phường / Xã</label>
                      <input
                        type="text"
                        placeholder="Phường Bến Nghé"
                        value={shippingAddress.ward}
                        onChange={handleAddressChange('ward')}
                        className="w-full bg-zinc-50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-primary-container/20 transition-all"
                      />
                    </div>
                    {/* District */}
                    <div className="space-y-2">
                      <label className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">Quận / Huyện</label>
                      <input
                        type="text"
                        placeholder="Quận 1"
                        value={shippingAddress.district}
                        onChange={handleAddressChange('district')}
                        className="w-full bg-zinc-50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-primary-container/20 transition-all"
                      />
                    </div>
                    {/* City */}
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">Tỉnh / Thành phố</label>
                      <input
                        type="text"
                        placeholder="Hồ Chí Minh"
                        value={shippingAddress.city}
                        onChange={handleAddressChange('city')}
                        className="w-full bg-zinc-50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-primary-container/20 transition-all"
                      />
                    </div>
                  </div>
                </section>

                {/* Shipping Method */}
                <section className="bg-white rounded-[32px] p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                      <span className="material-symbols-outlined">package_2</span>
                    </div>
                    <h2 className="text-2xl font-bold text-zinc-900 uppercase tracking-tight">
                      Shipping Method
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { value: 'standard', label: 'Standard', sub: '3–5 Business Days' },
                      { value: 'priority', label: 'Sonic Priority', sub: '1–2 Business Days' },
                    ].map(({ value, label, sub }) => (
                      <button
                        key={value}
                        onClick={() => setShippingMethod(value)}
                        className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-start gap-4 text-left
                          ${shippingMethod === value
                            ? 'border-primary-container bg-primary-container/5'
                            : 'border-zinc-100 bg-white hover:border-zinc-200'}`}
                      >
                        <div className="flex justify-between w-full items-center">
                          <span className="font-bold text-zinc-900">{label}</span>
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center
                              ${shippingMethod === value
                                ? 'border-primary-container bg-primary-container'
                                : 'border-zinc-300'}`}
                          >
                            {shippingMethod === value && (
                              <div className="w-2 h-2 rounded-full bg-white" />
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-zinc-500 font-bold uppercase">{sub}</p>
                      </button>
                    ))}
                  </div>
                </section>
              </>
            )}

            {/* ── Step 2: Payment ── */}
            {step === 2 && (
              <section className="bg-white rounded-[32px] p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600">
                    <span className="material-symbols-outlined">payments</span>
                  </div>
                  <h2 className="text-2xl font-bold text-zinc-900 uppercase tracking-tight">
                    Select Payment
                  </h2>
                </div>
                <div className="space-y-4">
                  {/* COD */}
                  <button
                    onClick={() => setPaymentMethod('cod')}
                    className={`w-full p-6 rounded-3xl border-2 transition-all flex items-center gap-6 text-left
                      ${paymentMethod === 'cod'
                        ? 'border-primary-container bg-primary-container/5'
                        : 'border-zinc-100 bg-white hover:border-zinc-200'}`}
                  >
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center
                        ${paymentMethod === 'cod' ? 'bg-primary-container text-white' : 'bg-zinc-50 text-zinc-400'}`}
                    >
                      <span className="material-symbols-outlined">payments</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-zinc-900">Thanh toán khi nhận hàng (COD)</p>
                      <p className="text-xs text-zinc-500 text-balance">
                        Thanh toán bằng tiền mặt khi shipper giao hàng đến địa chỉ của bạn.
                      </p>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0
                        ${paymentMethod === 'cod'
                          ? 'border-primary-container bg-primary-container'
                          : 'border-zinc-300'}`}
                    >
                      {paymentMethod === 'cod' && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  </button>

                  {/* VNPay */}
                  <button
                    onClick={() => setPaymentMethod('vnpay')}
                    className={`w-full p-6 rounded-3xl border-2 transition-all flex items-center gap-6 text-left
                      ${paymentMethod === 'vnpay'
                        ? 'border-primary-container bg-primary-container/5'
                        : 'border-zinc-100 bg-white hover:border-zinc-200'}`}
                  >
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white p-2 border border-zinc-100">
                      <img
                        src="https://sandbox.vnpayment.vn/paymentv2/Images/brands/logo.svg"
                        alt="VNPay"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-zinc-900">Ví điện tử VNPay</p>
                      <p className="text-xs text-zinc-500 text-balance">
                        Thanh toán nhanh chóng, an toàn qua ứng dụng ngân hàng hoặc ví VNPay.
                      </p>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0
                        ${paymentMethod === 'vnpay'
                          ? 'border-primary-container bg-primary-container'
                          : 'border-zinc-300'}`}
                    >
                      {paymentMethod === 'vnpay' && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  </button>
                </div>
              </section>
            )}

            {/* ── Step 3: Review ── */}
            {step === 3 && (
              <section className="bg-white rounded-[32px] p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600">
                    <span className="material-symbols-outlined">fact_check</span>
                  </div>
                  <h2 className="text-2xl font-bold text-zinc-900 uppercase tracking-tight">
                    Review Order
                  </h2>
                </div>
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="p-6 bg-zinc-50 rounded-2xl">
                      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3">Shipping to</p>
                      <p className="font-bold text-zinc-900">
                        {shippingAddress.firstName || shippingAddress.lastName
                          ? `${shippingAddress.firstName} ${shippingAddress.lastName}`.trim()
                          : 'Your Name'}
                      </p>
                      <p className="text-sm text-zinc-500 mt-1 leading-relaxed">
                        {fullAddressString || 'Your Address'}
                      </p>
                    </div>
                    <div className="p-6 bg-zinc-50 rounded-2xl">
                      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3">Payment via</p>
                      <p className="font-bold text-zinc-900">
                        {paymentMethod === 'cod' ? 'Cash on Delivery' : paymentMethod === 'vnpay' ? 'VNPay Wallet' : 'Not Selected'}
                      </p>
                      <p className="text-sm text-zinc-500">
                        {shippingMethod === 'priority' ? 'Sonic Priority (1–2 Days)' : 'Standard Delivery (3–5 Days)'}
                      </p>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="p-6 border border-zinc-100 rounded-2xl">
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4">
                      Items Summary
                    </p>
                    <div className="space-y-4">
                      {cartItems.map((item) => (
                        <div key={item.id} className="flex justify-between items-center text-sm">
                          <span className="text-zinc-600">
                            {item.name}{' '}
                            <span className="text-zinc-400">x{item.qty}</span>
                          </span>
                          <span className="font-bold text-zinc-900">
                            ${(item.price * item.qty).toFixed(2)}
                          </span>
                        </div>
                      ))}
                      {!loading && cartItems.length === 0 && (
                        <p className="text-sm text-zinc-400">Your cart is empty.</p>
                      )}
                    </div>
                  </div>

                  {error && (
                    <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-medium">
                      {error}
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center pt-6">
              {step > 1 ? (
                <button
                  onClick={() => setStep(step - 1)}
                  className="flex items-center gap-2 text-zinc-500 font-bold hover:text-zinc-900 transition-colors"
                >
                  <span className="material-symbols-outlined">arrow_back</span>
                  Back
                </button>
              ) : (
                <Link
                  to="/cart"
                  className="flex items-center gap-2 text-zinc-500 font-bold hover:text-zinc-900 transition-colors"
                >
                  <span className="material-symbols-outlined">arrow_back</span>
                  Back to Cart
                </Link>
              )}

              <button
                onClick={() => {
                  if (step === 1) {
                    handleContinueToPayment();
                  } else if (step === 2) {
                    if (currentOrderId && paymentMethod) {
                      orderService.updatePaymentMethod(currentOrderId, paymentMethod.toUpperCase())
                        .catch(err => console.error('Failed to save payment method:', err));
                    }
                    setStep(3);
                  } else {
                    handlePlaceOrder();
                  }
                }}
                disabled={isProcessingOrder}
                className="bg-primary-container text-white px-10 py-4 rounded-2xl font-bold shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50 disabled:hover:scale-100"
              >
                {step === 3 ? 'Place Order' : 'Continue'}
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
          </div>

          {/* Sidebar Summary */}
          <div className="lg:w-[380px]">
            <div className="bg-white rounded-[32px] p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.06)] sticky top-28">
              <h2 className="text-xl font-bold mb-8 uppercase tracking-tight">Order Summary</h2>

              <div className="space-y-6 mb-8">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4 items-center">
                    <div className="w-16 h-16 bg-zinc-50 rounded-2xl p-2 flex items-center justify-center shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-zinc-900 truncate">{item.name}</p>
                      <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                        Qty: {item.qty} | {item.size}
                      </p>
                    </div>
                    <p className="font-bold text-sm text-zinc-900">
                      ${(item.price * item.qty).toFixed(2)}
                    </p>
                  </div>
                ))}
                {!loading && cartItems.length === 0 && (
                  <p className="text-sm text-zinc-400">Your cart is empty.</p>
                )}
              </div>

              <div className="space-y-4 pt-6 border-t border-zinc-100 mb-8">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Subtotal</span>
                  <span className="font-bold text-zinc-900">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Shipping</span>
                  {shipping === 0 ? (
                    <span className="font-black text-primary-container uppercase text-xs">Free</span>
                  ) : (
                    <span className="font-bold text-zinc-900">${shipping.toFixed(2)}</span>
                  )}
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Estimated Tax</span>
                  <span className="font-bold text-zinc-900">${estimatedTax.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-between items-end mb-10">
                <span className="text-2xl font-black font-space-grotesk italic">Total</span>
                <div className="text-right">
                  <p className="text-3xl font-black text-primary-container font-space-grotesk italic">${total.toFixed(2)}</p>
                  {/* Hiển thị thêm dòng tạm tính tiền Việt cho user nhìn thấy */}
                  {paymentMethod === 'vnpay' && (
                    <p className="text-sm text-zinc-500 font-medium">
                      ~ {(total * EXCHANGE_RATE).toLocaleString('vi-VN')} VND
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CheckoutPage;