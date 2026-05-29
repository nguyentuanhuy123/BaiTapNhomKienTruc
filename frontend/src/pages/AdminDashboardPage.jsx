import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../services/adminService';
import { useAlert } from '../contexts/AlertContext';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    activeUsers: 0,
    flashSaleItems: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showAlert } = useAlert();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await adminService.getDashboardStats();
      
      setStats({
        totalRevenue: data.totalRevenue,
        totalOrders: data.totalOrders,
        activeUsers: data.activeUsers,
        flashSaleItems: 458 // This would come from flash sale service
      });

      // Get recent 4 orders
      const recent = data.orders
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 4)
        .map(order => ({
          id: order.orderNumber || `#${order.id}`,
          customer: order.user?.fullName || order.userResponse?.fullName || 'N/A',
          date: order.createdAt ? getTimeAgo(new Date(order.createdAt)) : 'N/A',
          total: order.totalPrice || 0,
          status: order.orderStatus || 'Processing',
          method: order.paymentMethod || 'N/A'
        }));
      
      setRecentOrders(recent);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      showAlert('Không thể tải dữ liệu dashboard!', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    return `${diffDays} ngày trước`;
  };

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

  // Analytical stats
  const statsData = [
    { label: 'Total Revenue', value: `$${stats.totalRevenue.toFixed(2)}`, icon: 'payments', change: '+12.5% this month', color: 'text-primary-container bg-primary-container/10 border-primary-container/20' },
    { label: 'Total Orders', value: stats.totalOrders.toString(), icon: 'shopping_cart', change: '+18.2% this week', color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
    { label: 'Active Users', value: stats.activeUsers.toString(), icon: 'group', change: '+4.3% since yesterday', color: 'text-violet-600 bg-violet-50 border-violet-100' },
    { label: 'Flash Sale Items Sold', value: stats.flashSaleItems.toString(), icon: 'bolt', change: 'Hazelcast Memory-decremented', color: 'text-amber-600 bg-amber-50 border-amber-100' },
  ];

  return (
    <div className="space-y-10 w-full">
      {/* Welcome Banner */}
      <div>
        <span className="bg-primary-container/10 text-primary-container text-xs px-4 py-1.5 rounded-full font-black uppercase tracking-widest mb-4 inline-block">
          System Overview
        </span>
        <h1 className="text-4xl font-space-grotesk font-black text-zinc-900 leading-none uppercase italic">
          Admin Dashboard
        </h1>
        <p className="text-zinc-500 mt-2 text-sm">
          Chào mừng trở lại! Dưới đây là thông số hiệu năng và thống kê kinh doanh thời gian thực của hệ thống Aero-Tech.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-3xl p-6 border border-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col justify-between">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">{stat.label}</p>
                <p className="text-3xl font-black font-space-grotesk italic text-zinc-950">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${stat.color}`}>
                <span className="material-symbols-outlined">{stat.icon}</span>
              </div>
            </div>
            <p className="text-[10px] font-bold text-zinc-400 flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">trending_up</span>
              {stat.change}
            </p>
          </div>
        ))}
      </div>

      {/* Revenue & Analytics Chart */}
      <div className="bg-white rounded-3xl p-8 border border-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
          <div>
            <h2 className="text-xl font-bold font-space-grotesk text-zinc-900 uppercase">Xu Hướng Doanh Thu</h2>
            <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest mt-1">Biểu đồ phân tích doanh thu uốn cong 6 tháng gần nhất</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-block w-3.5 h-3.5 bg-blue-600 rounded-full"></span>
            <span className="text-xs font-black text-zinc-600 uppercase tracking-wider font-space-grotesk">Doanh thu ($12,500.00)</span>
          </div>
        </div>

        {/* Beautiful Custom Curved SVG Chart */}
        <div className="relative w-full h-[240px] bg-zinc-50/30 rounded-[24px] p-6 border border-zinc-100/50 overflow-hidden group">
          {/* Chart SVG */}
          <svg className="w-full h-full" viewBox="0 0 1000 200" preserveAspectRatio="none">
            <defs>
              {/* Curve Gradient */}
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid Lines */}
            <line x1="0" y1="50" x2="1000" y2="50" stroke="#f4f4f5" strokeWidth="1" strokeDasharray="5,5" />
            <line x1="0" y1="100" x2="1000" y2="100" stroke="#f4f4f5" strokeWidth="1" strokeDasharray="5,5" />
            <line x1="0" y1="150" x2="1000" y2="150" stroke="#f4f4f5" strokeWidth="1" strokeDasharray="5,5" />

            {/* Area under the curve */}
            <path 
              d="M 0 200 Q 150 120, 300 160 T 600 60 T 900 110 L 1000 70 L 1000 200 Z" 
              fill="url(#chartGradient)"
            />

            {/* Curved Line itself */}
            <path 
              d="M 0 200 Q 150 120, 300 160 T 600 60 T 900 110 L 1000 70" 
              fill="none" 
              stroke="#2563eb" 
              strokeWidth="4.5" 
              strokeLinecap="round"
            />

            {/* Interactive Data Dots */}
            <circle cx="150" cy="140" r="6" fill="#fff" stroke="#2563eb" strokeWidth="3" />
            <circle cx="300" cy="160" r="6" fill="#fff" stroke="#2563eb" strokeWidth="3" />
            <circle cx="450" cy="100" r="6" fill="#fff" stroke="#2563eb" strokeWidth="3" />
            <circle cx="600" cy="60" r="6" fill="#fff" stroke="#2563eb" strokeWidth="3" />
            <circle cx="750" cy="85" r="6" fill="#fff" stroke="#2563eb" strokeWidth="3" />
            <circle cx="900" cy="110" r="6" fill="#fff" stroke="#2563eb" strokeWidth="3" />
          </svg>

          {/* Month Labels overlay */}
          <div className="absolute bottom-3 left-6 right-6 flex justify-between text-[10px] font-black text-zinc-400 uppercase tracking-widest">
            <span>Tháng 12</span>
            <span>Tháng 01</span>
            <span>Tháng 02</span>
            <span>Tháng 03</span>
            <span>Tháng 04</span>
            <span>Tháng 05</span>
          </div>

          {/* Glowing cursor indicator tooltip */}
          <div className="absolute top-10 left-[60%] -translate-x-1/2 bg-zinc-950 text-white px-4 py-2 rounded-xl shadow-xl flex flex-col items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <span className="text-[8px] font-black uppercase text-zinc-400 tracking-wider">Doanh thu đạt đỉnh</span>
            <span className="text-xs font-black font-space-grotesk italic text-blue-400 mt-0.5">$18,450.00</span>
          </div>
        </div>
      </div>

      {/* Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Orders */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-8 border border-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold font-space-grotesk text-zinc-900 uppercase">Giao dịch gần đây</h2>
            <Link to="/admin/orders" className="text-xs font-black text-primary-container hover:underline uppercase tracking-wider">
              Tất cả đơn hàng
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-100">
                  <th className="py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Mã đơn</th>
                  <th className="py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Khách hàng</th>
                  <th className="py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Tổng tiền</th>
                  <th className="py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {recentOrders.map((order, idx) => (
                  <tr key={idx} className="group hover:bg-zinc-50/50 transition-colors">
                    <td className="py-4 font-bold text-zinc-900">{order.id}</td>
                    <td className="py-4">
                      <p className="font-bold text-zinc-900 text-sm">{order.customer}</p>
                      <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">{order.date}</p>
                    </td>
                    <td className="py-4 font-black font-space-grotesk italic text-zinc-950">${order.total.toFixed(2)}</td>
                    <td className="py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black tracking-widest ${
                        order.status === 'Delivered' ? 'bg-green-50 text-green-600 border border-green-100' :
                        order.status === 'Processing' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                        order.status === 'In Transit' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                        'bg-red-50 text-red-600 border border-red-100'
                      }`}>
                        {order.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Server & IMDG Health Status */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-8 border border-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold font-space-grotesk text-zinc-900 uppercase mb-6">Trạng thái hệ thống</h2>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Eureka Registry</span>
                  <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">CONNECTED</span>
                </div>
                <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full w-[100%]"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Hazelcast RAM Space</span>
                  <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">ACTIVE</span>
                </div>
                <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full w-[95%]"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Kafka Message Broker</span>
                  <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">ONLINE</span>
                </div>
                <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full w-[100%]"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 bg-zinc-50 rounded-2xl p-5 border border-zinc-100 text-center">
            <span className="material-symbols-outlined text-4xl text-primary-container mb-2 block">dns</span>
            <p className="text-xs font-black text-zinc-900 uppercase font-space-grotesk">Aero-Tech Microservices</p>
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mt-1">Version 1.0.0 (Spring Cloud)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
