import { useState, useEffect } from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { orderService } from '../services/orderService';
import dayjs from 'dayjs';

const OrdersPage = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const tabs = ['All', 'Pending', 'Completed', 'Cancel'];

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const data = await orderService.getMyOrders();
        // Map backend order data to match the UI structure
        const formattedOrders = data.map(o => ({
          id: o.id,
          orderNumber: o.orderNumber,
          date: dayjs(o.createdAt).format('MMM DD, YYYY'),
          status: getUIStatus(o.orderStatus),
          total: o.totalPrice,
          items: o.orderLineItems.map(item => ({
            name: item.productName || 'Product',
            // Default image placeholder if no image exists in item, since we only have skuCode/etc.
            // But we actually might need to fall back or if item has image. 
            image: item.image || 'https://via.placeholder.com/80'
          }))
        }));
        setOrders(formattedOrders);
      } catch (error) {
        console.error('Lỗi lấy đơn hàng:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getUIStatus = (backendStatus) => {
    switch (backendStatus) {
      case 'PENDING':
      case 'AWAITING_PAYMENT':
        return 'Pending';
      case 'COMPLETED':
        return 'Completed';
      case 'CANCELLED':
      case 'FAILED':
        return 'Cancel';
      default:
        return 'Pending';
    }
  };

  const filteredOrders = activeTab === 'All' 
    ? orders 
    : orders.filter(o => o.status === activeTab);

  const handleOrderCancel = (order) => {
    setOrderToCancel(order);
    setIsCancelModalOpen(true);
  };

  const confirmCancel = async () => {
    if (!orderToCancel) return;
    try {
      setIsCancelling(true);
      await orderService.cancelOrder(orderToCancel.id);
      // Update the order status locally after cancellation
      setOrders(prevOrders => prevOrders.map(o =>
        o.id === orderToCancel.id ? { ...o, status: 'Cancel' } : o
      ));
      setIsCancelModalOpen(false);
      setOrderToCancel(null);
    } catch (error) {
      console.error('Lỗi hủy đơn hàng:', error);
      alert('Failed to cancel order: ' + (error.response?.data || error.message));
    } finally {
      setIsCancelling(false);
    }
  };

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
          {loading ? (
             <div className="py-20 text-center">
               <p className="text-zinc-400 font-bold uppercase text-xs tracking-widest">Loading orders...</p>
             </div>
          ) : filteredOrders.length > 0 ? (
            filteredOrders.map((order, idx) => (
              <div key={idx} className="bg-white rounded-[32px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] transition-all group">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-6 mb-8 pb-6 border-b border-zinc-50">
                  <div className="flex gap-8">
                    <div>
                      <p className="text-[10px] font-black text-zinc-300 uppercase tracking-widest mb-1">Order ID</p>
                      <p className="font-bold text-zinc-900">{order.orderNumber || order.id}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-zinc-300 uppercase tracking-widest mb-1">Date</p>
                      <p className="font-bold text-zinc-900">{order.date}</p>
                    </div>
                  </div>
                  <div className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest w-fit ${
                    order.status === 'Completed'
                      ? 'bg-green-100 text-green-600'
                      : order.status === 'Pending'
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-red-100 text-red-600'
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
                    <p className="text-2xl font-black font-space-grotesk italic text-zinc-900 mb-6">${order.total ? order.total.toFixed(2) : '0.00'}</p>
                    <div className="flex gap-3 w-full md:w-auto">
                      {order.status !== 'Completed' && order.status !== 'Cancel' && (
                        <button
                            onClick={() => handleOrderCancel(order)}
                            className="flex-1 md:flex-none px-6 py-3 bg-zinc-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all"
                        >
                          Cancel
                        </button>
                      )}
                      <button 
                        onClick={() => window.location.href = `/orders/${order.id}`}
                        className="flex-1 md:flex-none px-6 py-3 bg-zinc-100 text-zinc-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-200 transition-all"
                      >
                        View Details
                      </button>
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

      {/* Cancel Modal */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-zinc-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] p-8 max-w-md w-full shadow-[0_20px_50px_rgba(0,0,0,0.1)] transform transition-all scale-100 opacity-100">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                <span className="material-symbols-outlined">warning</span>
              </div>
              <div>
                <h3 className="text-xl font-space-grotesk font-black text-zinc-900 uppercase italic">Cancel Order</h3>
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Order ID: {orderToCancel?.orderNumber || orderToCancel?.id}</p>
              </div>
            </div>
            <p className="text-sm text-zinc-500 mb-8 font-medium">
              Are you sure you want to cancel this order? This action cannot be undone.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setIsCancelModalOpen(false);
                  setOrderToCancel(null);
                }}
                disabled={isCancelling}
                className="flex-1 px-6 py-3 bg-zinc-100 text-zinc-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-200 transition-all disabled:opacity-50"
              >
                Keep Order
              </button>
              <button
                onClick={confirmCancel}
                disabled={isCancelling}
                className="flex-1 px-6 py-3 bg-red-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:scale-105 transition-all flex items-center justify-center disabled:opacity-50"
              >
                {isCancelling ? (
                  <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                ) : (
                  'Yes, Cancel'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default OrdersPage;
