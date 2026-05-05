import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import CartItem from '../components/cart/CartItem';
import OrderSummary from '../components/cart/OrderSummary';

const CartPage = () => {
  // Mock cart data
  const [cartItems, setCartItems] = useState([
    {
      id: 101,
      name: "AERO-KNIT X1",
      variant: "Electric Blue",
      size: "US 10",
      price: 245.00,
      quantity: 1,
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDlNG2P_20pGAAH4lD1LeB5XUPjnnrFc1Iqelb0yK_m5pU8LBE-r1o2Qc0s98A3ibTFLgTBWkOL_Of5_oOH0uULbeky0x39_KUNX_WWNODTJMDKHAAG_xht_x1U0gWH71RRXbW_ZtO1ozzj1yI-3cDWy7ha4kOLfSxqzcFYN7BgdKbZ3lfnDHt2k0E7f0EimKNABOUGiiHM7MyaiARflxSGkXj5a0rOM8LI-ylmoHgcPxKHEJvRV5XyWWxtRcZzNNk7Ff5qopsRjeM"
    },
    {
      id: 102,
      name: "VELOCITY PRO",
      variant: "Midnight Black",
      size: "US 9.5",
      price: 189.00,
      quantity: 2,
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAz8dC1bhFHEAQ2mtNFLQZxqJmpjz1uJPQ9tyYXoNc7rwV15o7-D75288YdtAAKKdypNXvg0TQPkXwx4KrxVYtGLy1Y8QFAJn59CzNJ5ZIWzxeEPSWLJfwOaVcrAYiFm2wa2WCcg3BqmSlLGKsurmYPaiVyBpPBX8RxDPfdD_cljsNm3rmYifWKbkTaYmRTu4dlqrzVuyXY6Dwy_rNMSZ7ANnXgxhHwSNqWEo--SpdWOepwnSFNzUCcqqtmsZdRJbbjCUv5yW_MigY"
    }
  ]);

  const updateQuantity = (id, delta) => {
    setCartItems(cartItems.map(item => 
      item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
    ));
  };

  const removeItem = (id) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const shipping = 15.00;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />

      <main className="flex-1 pt-24 pb-20 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto w-full">
        <div className="flex flex-col lg:flex-row gap-16">
          {/* Left Column: Cart Items */}
          <div className="flex-1">
            <div className="flex justify-between items-end mb-10">
              <h1 className="text-headline-xl font-space-grotesk font-black text-zinc-900 uppercase italic tracking-tighter">Your Bag</h1>
              <p className="text-zinc-400 font-bold uppercase text-xs tracking-widest">{cartItems.length} Items</p>
            </div>

            {cartItems.length > 0 ? (
              <div className="space-y-8">
                {cartItems.map((item) => (
                  <CartItem 
                    key={item.id} 
                    item={item} 
                    onUpdateQuantity={updateQuantity} 
                    onRemove={removeItem} 
                  />
                ))}
              </div>
            ) : (
              <div className="py-20 text-center bg-zinc-50 rounded-[40px]">
                <span className="material-symbols-outlined text-6xl text-zinc-200 mb-6 block">shopping_bag</span>
                <p className="text-zinc-500 mb-8">Your bag is currently empty.</p>
                <Link to="/explore">
                  <button className="bg-primary-container text-white px-8 py-4 rounded-full font-bold shadow-lg hover:scale-105 transition-all">
                    Start Shopping
                  </button>
                </Link>
              </div>
            )}
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:w-[400px]">
            <OrderSummary 
              subtotal={subtotal} 
              shipping={shipping} 
              tax={tax} 
              total={total} 
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CartPage;
