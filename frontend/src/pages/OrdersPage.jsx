import React, { useState } from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

const OrdersPage = () => {
  const [activeTab, setActiveTab] = useState('All');

  const tabs = ['All', 'In Transit', 'Delivered', 'Cancelled'];

  const orders = [
    {
      id: "#VL-90821",
      date: "May 12, 2024",
      total: 220.00,
      status: "Delivered",
      items: [
        { name: "Velocity Air Max X1", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDlNG2P_20pGAAH4lD1LeB5XUPjnnrFc1Iqelb0yK_m5pU8LBE-r1o2Qc0s98A3ibTFLgTBWkOL_Of5_oOH0uULbeky0x39_KUNX_WWNODTJMDKHAAG_xht_x1U0gWH71RRXbW_ZtO1ozzj1yI-3cDWy7ha4kOLfSxqzcFYN7BgdKbZ3lfnDHt2k0E7f0EimKNABOUGiiHM7MyaiARflxSGkXj5a0rOM8LI-ylmoHgcPxKHEJvRV5XyWWxtRcZzNNk7Ff5qopsRjeM" }
      ]
    },
    {
      id: "#VL-88219",
      date: "May 08, 2024",
      total: 185.00,
      status: "In Transit",
      items: [
        { name: "Cloud Racer 2.0", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAz8dC1bhFHEAQ2mtNFLQZxqJmpjz1uJPQ9tyYXoNc7rwV15o7-D75288YdtAAKKdypNXvg0TQPkXwx4KrxVYtGLy1Y8QFAJn59CzNJ5ZIWzxeEPSWLJfwOaVcrAYiFm2wa2WCcg3BqmSlLGKsurmYPaiVyBpPBX8RxDPfdD_cljsNm3rmYifWKbkTaYmRTu4dlqrzVuyXY6Dwy_rNMSZ7ANnXgxhHwSNqWEo--SpdWOepwnSFNzUCcqqtmsZdRJbbjCUv5yW_MigY" }
      ]
    },
    {
      id: "#VL-85412",
      date: "April 20, 2024",
      total: 310.00,
      status: "Delivered",
      items: [
        { name: "Aero-Knit X1", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDlNG2P_20pGAAH4lD1LeB5XUPjnnrFc1Iqelb0yK_m5pU8LBE-r1o2Qc0s98A3ibTFLgTBWkOL_Of5_oOH0uULbeky0x39_KUNX_WWNODTJMDKHAAG_xht_x1U0gWH71RRXbW_ZtO1ozzj1yI-3cDWy7ha4kOLfSxqzcFYN7BgdKbZ3lfnDHt2k0E7f0EimKNABOUGiiHM7MyaiARflxSGkXj5a0rOM8LI-ylmoHgcPxKHEJvRV5XyWWxtRcZzNNk7Ff5qopsRjeM" }
      ]
    }
  ];

  const filteredOrders = activeTab === 'All' 
    ? orders 
    : orders.filter(o => o.status === activeTab);

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50/50">
      <Navbar />

      <main className="flex-1 pt-24 pb-20 px-margin-mobile md:px-margin-desktop max-w-[1000px] mx-auto w-full">
        <header className="mb-12">
          <h1 className="text-4xl font-space-grotesk font-black text-zinc-900 uppercase italic tracking-tighter mb-4">My Orders</h1>
          <p className="text-zinc-400 font-bold uppercase text-xs tracking-widest">Track and manage your recent purchases</p>
        </header>

        {/* Tabs Filter */}
        <div className="flex gap-2 mb-10 overflow-x-auto pb-2 no-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                activeTab === tab 
                ? 'bg-primary-container text-white shadow-lg' 
                : 'bg-white text-zinc-400 hover:text-zinc-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order, idx) => (
              <div key={idx} className="bg-white rounded-[32px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] transition-all group">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-6 mb-8 pb-6 border-b border-zinc-50">
                  <div className="flex gap-8">
                    <div>
                      <p className="text-[10px] font-black text-zinc-300 uppercase tracking-widest mb-1">Order ID</p>
                      <p className="font-bold text-zinc-900">{order.id}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-zinc-300 uppercase tracking-widest mb-1">Date</p>
                      <p className="font-bold text-zinc-900">{order.date}</p>
                    </div>
                  </div>
                  <div className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest w-fit ${
                    order.status === 'Delivered' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                  }`}>
                    {order.status.toUpperCase()}
                  </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                  <div className="flex items-center gap-6">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <div className="w-20 h-20 bg-zinc-50 rounded-2xl p-2">
                          <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                        </div>
                        <p className="font-bold text-zinc-900 max-w-[150px] leading-tight">{item.name}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col items-end w-full md:w-auto">
                    <p className="text-[10px] font-black text-zinc-300 uppercase tracking-widest mb-1">Total Amount</p>
                    <p className="text-2xl font-black font-space-grotesk italic text-zinc-900 mb-6">${order.total.toFixed(2)}</p>
                    <div className="flex gap-3 w-full md:w-auto">
                      <button className="flex-1 md:flex-none px-6 py-3 bg-zinc-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all">Track Order</button>
                      <button className="flex-1 md:flex-none px-6 py-3 bg-zinc-100 text-zinc-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-200 transition-all">View Details</button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 text-center bg-white rounded-[40px] shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <span className="material-symbols-outlined text-6xl text-zinc-100 mb-4 block">package_2</span>
              <p className="text-zinc-400 font-bold uppercase text-xs tracking-widest">No orders found in this category</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OrdersPage;
