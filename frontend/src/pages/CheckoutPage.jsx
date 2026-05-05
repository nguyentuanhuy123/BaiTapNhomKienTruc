import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

const CheckoutPage = () => {
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [orderPlaced, setOrderPlaced] = useState(false);

  const cartItems = [
    { id: 1, name: "Velocity Pro 1.0", size: "10.5", color: "Neon Pulse", qty: 1, price: 180.00, image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDlNG2P_20pGAAH4lD1LeB5XUPjnnrFc1Iqelb0yK_m5pU8LBE-r1o2Qc0s98A3ibTFLgTBWkOL_Of5_oOH0uULbeky0x39_KUNX_WWNODTJMDKHAAG_xht_x1U0gWH71RRXbW_ZtO1ozzj1yI-3cDWy7ha4kOLfSxqzcFYN7BgdKbZ3lfnDHt2k0E7f0EimKNABOUGiiHM7MyaiARflxSGkXj5a0rOM8LI-ylmoHgcPxKHEJvRV5XyWWxtRcZzNNk7Ff5qopsRjeM" },
    { id: 2, name: "StepTech Socks", size: "L", color: "Arctic White", qty: 2, price: 24.00, image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAz8dC1bhFHEAQ2mtNFLQZxqJmpjz1uJPQ9tyYXoNc7rwV15o7-D75288YdtAAKKdypNXvg0TQPkXwx4KrxVYtGLy1Y8QFAJn59CzNNj1yI-3cDWy7ha4kOLfSxqzcFYN7BgdKbZ3lfnDHt2k0E7f0EimKNABOUGiiHM7MyaiARflxSGkXj5a0rOM8LI-ylmoHgcPxKHEJvRV5XyWWxtRcZzNNk7Ff5qopsRjeM" }
  ];

  if (orderPlaced) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-8">
          <div className="text-center max-w-lg">
            <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
              <span className="material-symbols-outlined text-5xl font-black">check</span>
            </div>
            <h1 className="text-4xl font-space-grotesk font-black text-zinc-900 mb-4 uppercase italic">Order Confirmed!</h1>
            <p className="text-zinc-500 mb-10 leading-relaxed">
              Your order <span className="text-zinc-900 font-bold">#VT-99281</span> has been placed successfully. 
              We'll send you a confirmation email with tracking details shortly.
            </p>
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

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50/50">
      <Navbar />

      <main className="flex-1 pt-24 pb-20 px-margin-mobile md:px-margin-desktop max-w-[1200px] mx-auto w-full">
        {/* Stepper */}
        <div className="flex justify-center items-center gap-4 md:gap-8 mb-16">
          <div className={`flex items-center gap-3 transition-opacity ${step >= 1 ? 'opacity-100' : 'opacity-40'}`}>
            <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 1 ? 'bg-primary-container text-white' : 'bg-zinc-200 text-zinc-600'}`}>1</span>
            <span className="text-zinc-900 font-bold text-sm">Shipping</span>
          </div>
          <div className={`w-12 h-[2px] ${step >= 2 ? 'bg-primary-container' : 'bg-zinc-200'}`}></div>
          <div className={`flex items-center gap-3 transition-opacity ${step >= 2 ? 'opacity-100' : 'opacity-40'}`}>
            <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 2 ? 'bg-primary-container text-white' : 'bg-zinc-200 text-zinc-600'}`}>2</span>
            <span className="text-zinc-900 font-bold text-sm">Payment</span>
          </div>
          <div className={`w-12 h-[2px] ${step >= 3 ? 'bg-primary-container' : 'bg-zinc-200'}`}></div>
          <div className={`flex items-center gap-3 transition-opacity ${step >= 3 ? 'opacity-100' : 'opacity-40'}`}>
            <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 3 ? 'bg-primary-container text-white' : 'bg-zinc-200 text-zinc-600'}`}>3</span>
            <span className="text-zinc-900 font-bold text-sm">Review</span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Main Content Area */}
          <div className="flex-1 space-y-10">
            {step === 1 && (
              <>
                {/* Shipping Address */}
                <section className="bg-white rounded-[32px] p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-primary-container">
                      <span className="material-symbols-outlined">local_shipping</span>
                    </div>
                    <h2 className="text-2xl font-bold text-zinc-900 uppercase tracking-tight">Shipping Address</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">First Name</label>
                      <input type="text" placeholder="John" className="w-full bg-zinc-50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-primary-container/20 transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">Last Name</label>
                      <input type="text" placeholder="Doe" className="w-full bg-zinc-50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-primary-container/20 transition-all" />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">Street Address</label>
                      <input type="text" placeholder="123 Performance Way" className="w-full bg-zinc-50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-primary-container/20 transition-all" />
                    </div>
                  </div>
                </section>

                {/* Shipping Method */}
                <section className="bg-white rounded-[32px] p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                      <span className="material-symbols-outlined">package_2</span>
                    </div>
                    <h2 className="text-2xl font-bold text-zinc-900 uppercase tracking-tight">Shipping Method</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button 
                      onClick={() => setShippingMethod('standard')}
                      className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-start gap-4 text-left ${shippingMethod === 'standard' ? 'border-primary-container bg-primary-container/5' : 'border-zinc-100 bg-white hover:border-zinc-200'}`}
                    >
                      <div className="flex justify-between w-full items-center">
                        <span className="font-bold text-zinc-900">Standard</span>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${shippingMethod === 'standard' ? 'border-primary-container bg-primary-container' : 'border-zinc-300'}`}>
                          {shippingMethod === 'standard' && <div className="w-2 h-2 rounded-full bg-white"></div>}
                        </div>
                      </div>
                      <p className="text-xs text-zinc-500 font-bold uppercase">3–5 Business Days</p>
                    </button>
                    <button 
                      onClick={() => setShippingMethod('priority')}
                      className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-start gap-4 text-left ${shippingMethod === 'priority' ? 'border-primary-container bg-primary-container/5' : 'border-zinc-100 bg-white hover:border-zinc-200'}`}
                    >
                      <div className="flex justify-between w-full items-center">
                        <span className="font-bold text-zinc-900">Sonic Priority</span>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${shippingMethod === 'priority' ? 'border-primary-container bg-primary-container' : 'border-zinc-300'}`}>
                          {shippingMethod === 'priority' && <div className="w-2 h-2 rounded-full bg-white"></div>}
                        </div>
                      </div>
                      <p className="text-xs text-zinc-500 font-bold uppercase">1–2 Business Days</p>
                    </button>
                  </div>
                </section>
              </>
            )}

            {step === 2 && (
              <section className="bg-white rounded-[32px] p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600">
                    <span className="material-symbols-outlined">payments</span>
                  </div>
                  <h2 className="text-2xl font-bold text-zinc-900 uppercase tracking-tight">Select Payment</h2>
                </div>
                <div className="space-y-4">
                  <button 
                    onClick={() => setPaymentMethod('cod')}
                    className={`w-full p-6 rounded-3xl border-2 transition-all flex items-center gap-6 text-left ${paymentMethod === 'cod' ? 'border-primary-container bg-primary-container/5' : 'border-zinc-100 bg-white hover:border-zinc-200'}`}
                  >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${paymentMethod === 'cod' ? 'bg-primary-container text-white' : 'bg-zinc-50 text-zinc-400'}`}>
                      <span className="material-symbols-outlined">payments</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-zinc-900">Thanh toán khi nhận hàng (COD)</p>
                      <p className="text-xs text-zinc-500 text-balance">Thanh toán bằng tiền mặt khi shipper giao hàng đến địa chỉ của bạn.</p>
                    </div>
                  </button>
                  <button 
                    onClick={() => setPaymentMethod('vnpay')}
                    className={`w-full p-6 rounded-3xl border-2 transition-all flex items-center gap-6 text-left ${paymentMethod === 'vnpay' ? 'border-primary-container bg-primary-container/5' : 'border-zinc-100 bg-white hover:border-zinc-200'}`}
                  >
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white p-2 border border-zinc-100">
                      <img src="https://sandbox.vnpayment.vn/paymentv2/Images/brands/logo.svg" alt="VNPay" className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-zinc-900">Ví điện tử VNPay</p>
                      <p className="text-xs text-zinc-500 text-balance">Thanh toán nhanh chóng, an toàn qua ứng dụng ngân hàng hoặc ví VNPay.</p>
                    </div>
                  </button>
                </div>
              </section>
            )}

            {step === 3 && (
              <section className="bg-white rounded-[32px] p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600">
                    <span className="material-symbols-outlined">fact_check</span>
                  </div>
                  <h2 className="text-2xl font-bold text-zinc-900 uppercase tracking-tight">Review Order</h2>
                </div>
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="p-6 bg-zinc-50 rounded-2xl">
                      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3">Shipping to</p>
                      <p className="font-bold text-zinc-900">John Doe</p>
                      <p className="text-sm text-zinc-500">123 Performance Way, Portland, Oregon</p>
                    </div>
                    <div className="p-6 bg-zinc-50 rounded-2xl">
                      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3">Payment via</p>
                      <p className="font-bold text-zinc-900">{paymentMethod === 'cod' ? 'Cash on Delivery' : 'VNPay Wallet'}</p>
                      <p className="text-sm text-zinc-500">Standard Delivery (3-5 Days)</p>
                    </div>
                  </div>
                  <div className="p-6 border border-zinc-100 rounded-2xl">
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4">Items Summary</p>
                    <div className="space-y-4">
                      {cartItems.map(item => (
                        <div key={item.id} className="flex justify-between items-center text-sm">
                          <span className="text-zinc-600">{item.name} <span className="text-zinc-400">x{item.qty}</span></span>
                          <span className="font-bold text-zinc-900">${(item.price * item.qty).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
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
                <Link to="/cart" className="flex items-center gap-2 text-zinc-500 font-bold hover:text-zinc-900 transition-colors">
                  <span className="material-symbols-outlined">arrow_back</span>
                  Back to Cart
                </Link>
              )}
              
              <button 
                onClick={() => step < 3 ? setStep(step + 1) : setOrderPlaced(true)}
                className="bg-primary-container text-white px-10 py-4 rounded-2xl font-bold shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
              >
                {step === 3 ? 'Place Order' : 'Continue'}
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
          </div>

          {/* Sidebar Summary (Always visible) */}
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
                      <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Qty: {item.qty} | {item.size}</p>
                    </div>
                    <p className="font-bold text-sm text-zinc-900">${(item.price * item.qty).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-4 pt-6 border-t border-zinc-100 mb-8">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Subtotal</span>
                  <span className="font-bold text-zinc-900">$228.00</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Shipping</span>
                  <span className="font-black text-primary-container uppercase text-xs">Free</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Estimated Tax</span>
                  <span className="font-bold text-zinc-900">$18.24</span>
                </div>
              </div>

              <div className="flex justify-between items-end mb-10">
                <span className="text-2xl font-black font-space-grotesk italic">Total</span>
                <span className="text-3xl font-black text-primary-container font-space-grotesk italic">$246.24</span>
              </div>

              <button className="w-full bg-primary-container text-white font-bold py-5 rounded-2xl shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all">
                Complete Secure Purchase
              </button>

              <div className="mt-6 flex items-center justify-center gap-2 text-zinc-400">
                <span className="material-symbols-outlined text-sm">lock</span>
                <span className="text-[10px] font-bold uppercase tracking-widest">SSL Encrypted Checkout</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CheckoutPage;
