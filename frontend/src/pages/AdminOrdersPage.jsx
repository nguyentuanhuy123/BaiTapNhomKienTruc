import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import { useAlert } from '../contexts/AlertContext';

const AdminOrdersPage = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showAlert } = useAlert();

  const tabs = ['All', 'Pending', 'Processing', 'In Transit', 'Delivered', 'Cancelled'];

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllOrders();
      // Transform backend data to match frontend format
      const transformedOrders = data.map(order => ({
        id: order.orderNumber || `#${order.id}`,
        orderId: order.id,
        customer: order.user?.fullName || order.userResponse?.fullName || 'N/A',
        email: order.user?.email || order.userResponse?.email || 'N/A',
        date: order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' }) : 'N/A',
        total: order.totalPrice || 0,
        status: order.orderStatus || 'Pending',
        method: order.paymentMethod || 'N/A',
        items: (order.orderLineItems || order.orderLineItemsDtoList)?.map(item => ({
          name: item.productName || item.skuCode || 'N/A',
          image: item.imageUrl || 'https://via.placeholder.com/150',
          qty: item.quantity || 0,
          price: item.price || 0
        })) || []
      }));
      setOrders(transformedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      showAlert('Không thể tải danh sách đơn hàng!', 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await adminService.updateOrderStatus(orderId, newStatus);
      setOrders(orders.map(o => o.orderId === orderId ? { ...o, status: newStatus } : o));
      if (selectedOrder && selectedOrder.orderId === orderId) {
        setSelectedOrder(prev => ({ ...prev, status: newStatus }));
      }
      showAlert('Cập nhật trạng thái đơn hàng thành công!', 'success');
    } catch (error) {
      console.error('Error updating order status:', error);
      showAlert('Không thể cập nhật trạng thái đơn hàng!', 'error');
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesTab = activeTab === 'All' || order.status.toLowerCase() === activeTab.toLowerCase();
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          order.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-container mx-auto mb-4"></div>
          <p className="text-zinc-500 font-bold">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 w-full">
      {/* Header */}
      <div>
        <span className="bg-primary-container/10 text-primary-container text-xs px-4 py-1.5 rounded-full font-black uppercase tracking-widest mb-4 inline-block">
          Sales Operations
        </span>
        <h1 className="text-4xl font-space-grotesk font-black text-zinc-900 leading-none uppercase italic">
          Order Management
        </h1>
        <p className="text-zinc-500 mt-2 text-sm">
          Xem thông tin, kiểm tra chi tiết giỏ hàng và cập nhật tiến trình đơn hàng của khách hàng.
        </p>
      </div>

      {/* Tabs and Search Bar */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center justify-between">
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-primary-container text-white shadow-md'
                  : 'bg-white text-zinc-400 hover:text-zinc-900 border border-zinc-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl px-5 py-3 border border-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.01)] flex gap-3 items-center w-full md:w-80 shrink-0">
          <span className="material-symbols-outlined text-zinc-400 text-sm">search</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo Mã đơn, Tên..."
            className="w-full text-xs text-zinc-800 outline-none bg-transparent font-bold"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-[32px] p-8 border border-zinc-100 shadow-[0_20px_50px_rgba(0,0,0,0.02)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-100">
                <th className="pb-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Đơn hàng</th>
                <th className="pb-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Khách hàng</th>
                <th className="pb-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Tổng tiền</th>
                <th className="pb-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Trạng thái</th>
                <th className="pb-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="group hover:bg-zinc-50/50 transition-colors">
                  <td className="py-5 font-bold text-zinc-900">
                    <p>{order.id}</p>
                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mt-1">{order.date}</p>
                  </td>
                  <td className="py-5">
                    <p className="font-bold text-zinc-900 text-sm">{order.customer}</p>
                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mt-0.5">{order.email}</p>
                  </td>
                  <td className="py-5 font-black font-space-grotesk italic text-zinc-950">${order.total.toFixed(2)}</td>
                  <td className="py-5">
                    <span className={`px-3 py-1 rounded-md text-[9px] font-black tracking-widest ${
                      order.status === 'Delivered' ? 'bg-green-50 text-green-600 border border-green-100' :
                      order.status === 'Pending' ? 'bg-zinc-100 text-zinc-500 border border-zinc-200' :
                      order.status === 'Processing' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                      order.status === 'In Transit' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                      'bg-red-50 text-red-600 border border-red-100'
                    }`}>
                      {order.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-5 text-right flex items-center justify-end gap-3">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="px-4 py-2 border border-zinc-100 hover:border-zinc-300 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
                    >
                      DETAILS
                    </button>
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.orderId, e.target.value)}
                      className="px-3 py-2 bg-zinc-50 hover:bg-zinc-100 border border-zinc-100 rounded-xl text-[9px] font-black uppercase tracking-widest outline-none cursor-pointer text-zinc-800 transition-all"
                    >
                      <option value="PENDING">Pending</option>
                      <option value="PROCESSING">Processing</option>
                      <option value="IN_TRANSIT">In Transit</option>
                      <option value="DELIVERED">Delivered</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Dialog */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-zinc-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in">
          <div className="bg-white rounded-[32px] w-full max-w-2xl p-8 border border-zinc-100 shadow-[0_20px_50px_rgba(0,0,0,0.15)] animate-scale-up">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-zinc-50">
              <div>
                <h2 className="text-xl font-bold font-space-grotesk text-zinc-900 uppercase">Chi tiết Đơn hàng</h2>
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mt-1">Mã: {selectedOrder.id} • Ngày: {selectedOrder.date}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-10 h-10 rounded-full hover:bg-zinc-100 flex items-center justify-center text-zinc-400 hover:text-zinc-900 transition-all"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Customer Details */}
            <div className="bg-zinc-50 rounded-2xl p-5 border border-zinc-100 mb-6 grid grid-cols-2 gap-4">
              <div>
                <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Khách hàng</p>
                <p className="font-bold text-zinc-900 text-sm">{selectedOrder.customer}</p>
                <p className="text-xs text-zinc-500 font-semibold">{selectedOrder.email}</p>
              </div>
              <div>
                <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Thanh toán qua</p>
                <p className="font-bold text-zinc-950 text-sm">{selectedOrder.method}</p>
                <p className="text-xs text-primary-container font-black tracking-wider uppercase mt-1">Status: {selectedOrder.status}</p>
              </div>
            </div>

            {/* Product Items */}
            <div className="space-y-4 mb-6">
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Sản phẩm trong đơn</p>
              {selectedOrder.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center p-4 bg-zinc-50/50 rounded-xl border border-zinc-100">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white border border-zinc-100 rounded-lg p-2 shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <p className="font-bold text-zinc-900 leading-tight text-sm">{item.name}</p>
                      <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mt-1">Đơn giá: ${item.price.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-zinc-600">Số lượng: <span className="font-black text-zinc-950">x{item.qty}</span></p>
                    <p className="font-black font-space-grotesk italic text-zinc-950 mt-1">${(item.price * item.qty).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Total Footer */}
            <div className="flex justify-between items-center pt-6 border-t border-zinc-100">
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Tổng tiền thanh toán</span>
              <span className="text-2xl font-black font-space-grotesk italic text-zinc-950">${selectedOrder.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrdersPage;
