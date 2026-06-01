import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { orderService } from '../services/orderService';
import dayjs from 'dayjs';

const OrderDetailPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        // We get all orders and filter by orderNumber (which is used as ID in UI)
        const data = await orderService.getMyOrders();
        const rawOrder = data.find(o => o.orderNumber === id || o.id.toString() === id);
        
        if (rawOrder) {
          const formattedOrder = {
            id: rawOrder.orderNumber,
            date: dayjs(rawOrder.createdAt).format('MMM DD, YYYY'),
            status: getUIStatus(rawOrder.orderStatus),
            total: rawOrder.totalPrice,
            subtotal: rawOrder.subtotal || rawOrder.totalPrice, // Fallback if backend doesn't send subtotal
            shippingMethod: rawOrder.shippingMethod || 'Standard',
            paymentMethod: rawOrder.paymentMethod || 'Credit Card',
            items: rawOrder.orderLineItems.map(item => ({
              name: item.productName || 'Product',
              price: item.price,
              quantity: item.quantity,
              color: item.color,
              size: item.size,
              image: item.image || 'https://via.placeholder.com/80'
            }))
          };
          setOrder(formattedOrder);
        }
      } catch (error) {
        console.error('Lỗi lấy chi tiết đơn hàng:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [id]);

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

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-zinc-50/50">
        <Navbar />
        <main className="flex-1 flex items-center justify-center pt-24 pb-20">
          <p className="text-zinc-400 font-bold uppercase text-xs tracking-widest">Loading details...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col min-h-screen bg-zinc-50/50">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center pt-24 pb-20">
          <p className="text-zinc-400 font-bold uppercase text-xs tracking-widest mb-4">Order not found</p>
          <Link to="/orders" className="text-primary font-bold hover:underline">Back to Orders</Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50/50">
      <Navbar />

      <main className="flex-1 pt-24 pb-20 px-margin-mobile md:px-margin-desktop max-w-[1000px] mx-auto w-full">
        <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <Link to="/orders" className="text-zinc-400 hover:text-zinc-900 text-xs font-bold uppercase tracking-widest flex items-center gap-2 mb-6 transition-colors">
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Back to Orders
            </Link>
            <h1 className="text-4xl font-space-grotesk font-black text-zinc-900 uppercase italic tracking-tighter mb-2">Order Details</h1>
            <p className="text-zinc-400 font-bold text-sm">ID: {order.id}</p>
          </div>
          <div className="text-right">
            <p className="text-zinc-400 font-bold uppercase text-xs tracking-widest mb-2">Order placed on</p>
            <p className="font-bold text-zinc-900">{order.date}</p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-[32px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <h2 className="text-lg font-black uppercase tracking-widest text-zinc-900 mb-6 border-b border-zinc-100 pb-4">Items Summary</h2>
              
              <div className="space-y-6">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex gap-6 items-center">
                    <div className="w-24 h-24 bg-zinc-50 rounded-2xl p-2 shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-zinc-900 mb-1">{item.name}</h3>
                      <p className="text-xs text-zinc-500 font-medium space-x-2">
                        {item.color && <span>Color: {item.color}</span>}
                        {item.size && <span>Size: {item.size}</span>}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-zinc-900 mb-1">${(item.price * item.quantity).toFixed(2)}</p>
                      <p className="text-xs text-zinc-400 font-bold">Qty: {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-[32px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <h2 className="text-lg font-black uppercase tracking-widest text-zinc-900 mb-6 border-b border-zinc-100 pb-4">Order Summary</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Status</span>
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest ${
                    order.status === 'Completed'
                      ? 'bg-green-100 text-green-600'
                      : order.status === 'Pending'
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-red-100 text-red-600'
                  }`}>
                    {order.status.toUpperCase()}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Payment</span>
                  <span className="text-sm font-bold text-zinc-900">{order.paymentMethod}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Shipping</span>
                  <span className="text-sm font-bold text-zinc-900 capitalize">{order.shippingMethod}</span>
                </div>

                <div className="pt-4 mt-4 border-t border-zinc-100">
                  <div className="flex justify-between items-end">
                    <span className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Total</span>
                    <span className="text-3xl font-black font-space-grotesk italic text-zinc-900">
                      ${order.total ? order.total.toFixed(2) : '0.00'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {order.status === 'Pending' && (
              <button className="w-full px-6 py-4 bg-zinc-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-[1.02] transition-all">
                Cancel Order
              </button>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OrderDetailPage;
