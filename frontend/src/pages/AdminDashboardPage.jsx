import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../services/adminService';
import { useAlert } from '../contexts/AlertContext';
import { flashSaleService } from '../services/flashSaleService';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    activeUsers: 0,
    flashSaleItems: 0
  });
  const [rawOrders, setRawOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeBarIndex, setActiveBarIndex] = useState(5); // Hover state for month bars
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear()); // Year Filter
  const [calendarFilterDay, setCalendarFilterDay] = useState(null); // Calendar Interactive Day Filter
  const [viewDate, setViewDate] = useState(new Date()); // Dynamic calendar month viewer state
  const { showAlert } = useAlert();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch both dashboard stats and flash sale campaigns in parallel
      const [data, campaigns] = await Promise.all([
        adminService.getDashboardStats(),
        flashSaleService.getAllCampaigns().catch(err => {
          console.warn('Could not fetch flash sale campaigns for dashboard statistics:', err);
          return [];
        })
      ]);
      
      // Calculate dynamic flash sale sold items across all campaigns and products
      let dynamicFlashSaleSold = 0;
      if (Array.isArray(campaigns)) {
        campaigns.forEach(c => {
          if (Array.isArray(c.products)) {
            c.products.forEach(p => {
              dynamicFlashSaleSold += (p.soldQuantity || 0);
            });
          }
        });
      }
      
      setStats({
        totalRevenue: data.totalRevenue,
        totalOrders: data.totalOrders,
        activeUsers: data.activeUsers,
        flashSaleItems: dynamicFlashSaleSold
      });

      setRawOrders(data.orders || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      showAlert('Không thể tải dữ liệu dashboard!', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Dynamic selector helper for unique years in order history
  const getAvailableYears = () => {
    if (rawOrders.length === 0) return [new Date().getFullYear()];
    const years = [...new Set(rawOrders.map(o => {
      if (!o.createdAt) return null;
      return new Date(o.createdAt).getFullYear();
    }).filter(Boolean))];
    if (years.length === 0) return [new Date().getFullYear()];
    return years.sort((a, b) => b - a);
  };

  // Helper: Get list of calendar days for dynamic viewDate & map real transaction dates
  const getCalendarDays = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    
    // Find days of viewDate month that actually contain orders in the database
    const daysWithOrders = rawOrders.map(o => {
      if (!o.createdAt) return null;
      const d = new Date(o.createdAt);
      if (d.getFullYear() === year && d.getMonth() === month) {
        return d.getDate();
      }
      return null;
    }).filter(Boolean);
    const uniqueOrderDays = [...new Set(daysWithOrders)];

    const days = [];
    // Pad empty cells before the 1st
    for (let i = 0; i < firstDay; i++) {
      days.push({ day: '', isCurrent: false });
    }
    // Add real days
    for (let i = 1; i <= totalDays; i++) {
      days.push({ 
        day: i, 
        isCurrent: true,
        isToday: i === today.getDate() && month === today.getMonth() && year === today.getFullYear(),
        hasOrders: uniqueOrderDays.includes(i) // True if an order was placed on this day
      });
    }
    return days;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-zinc-500 font-bold">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  const calendarDays = getCalendarDays();
  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  // ── 1. DYNAMIC SINGLE-BAR MONTHLY ORDERS CHART BY SELECTED YEAR ───────────
  const getDynamicBarChartData = () => {
    const months = [
      { label: 'JAN', monthNum: 0, count: 0 },
      { label: 'FEB', monthNum: 1, count: 0 },
      { label: 'MAR', monthNum: 2, count: 0 },
      { label: 'APR', monthNum: 3, count: 0 },
      { label: 'MAY', monthNum: 4, count: 0 },
      { label: 'JUN', monthNum: 5, count: 0 },
      { label: 'JUL', monthNum: 6, count: 0 },
      { label: 'AUG', monthNum: 7, count: 0 },
      { label: 'SEP', monthNum: 8, count: 0 },
    ];

    rawOrders.forEach(order => {
      if (!order.createdAt) return;
      const date = new Date(order.createdAt);
      const year = date.getFullYear();
      const month = date.getMonth();

      if (year === selectedYear) {
        const targetMonth = months.find(m => m.monthNum === month);
        if (targetMonth) {
          targetMonth.count += 1;
        }
      }
    });

    const totalOrdersInSelectedYear = months.reduce((sum, m) => sum + m.count, 0);
    
    // Fallback template if database has zero orders for the selected year
    if (totalOrdersInSelectedYear === 0) {
      return [
        { label: 'JAN', count: 38 },
        { label: 'FEB', count: 44 },
        { label: 'MAR', count: 32 },
        { label: 'APR', count: 15 },
        { label: 'MAY', count: 28 },
        { label: 'JUN', count: 48 },
        { label: 'JUL', count: 20 },
        { label: 'AUG', count: 24 },
        { label: 'SEP', count: 19 },
      ];
    }

    // Scale values so they fit perfectly inside the SVG height proportion (max 45 units)
    const maxVal = Math.max(...months.map(m => m.count), 1);
    return months.map(m => ({
      label: m.label,
      count: Math.round((m.count / maxVal) * 45) || 5, // minimum height placeholder
      realCount: m.count // true database count
    }));
  };

  const barChartData = getDynamicBarChartData();

  // ── 2. DYNAMIC SPLINE AREA CHART DATA ──────────────────────────────────────
  const getDynamicSplineData = () => {
    const months = [];
    const now = new Date();
    
    // Prepare last 6 months slots
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        monthKey: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
        revenue: 0,
        orders: 0
      });
    }

    rawOrders.forEach(order => {
      if (!order.createdAt) return;
      const date = new Date(order.createdAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      const targetMonth = months.find(m => m.monthKey === key);
      if (targetMonth) {
        targetMonth.revenue += (order.totalPrice || 0);
        targetMonth.orders += 1;
      }
    });

    const totalRev = months.reduce((sum, m) => sum + m.revenue, 0);
    // Fallback shapes for brand new store
    if (totalRev === 0) {
      return [
        { revenue: 15, orders: 35 },
        { revenue: 35, orders: 15 },
        { revenue: 20, orders: 40 },
        { revenue: 45, orders: 25 },
        { revenue: 30, orders: 50 },
        { revenue: 60, orders: 20 }
      ];
    }

    return months;
  };

  const splineData = getDynamicSplineData();
  const maxSplineRevenue = Math.max(...splineData.map(d => d.revenue), 10);
  const maxSplineOrders = Math.max(...splineData.map(d => d.orders), 1);

  // Map database coordinates into the SVG viewport grid (width 450, height 150)
  const revenuePoints = splineData.map((d, i) => ({
    x: i * (450 / (splineData.length - 1)),
    y: 135 - (d.revenue / maxSplineRevenue) * 95 
  }));

  const ordersPoints = splineData.map((d, i) => ({
    x: i * (450 / (splineData.length - 1)),
    y: 135 - (d.orders / maxSplineOrders) * 55 
  }));

  // Bezier curve path generator
  const getDynamicBezierPath = (pts) => {
    if (pts.length === 0) return '';
    let path = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      const cpX1 = p0.x + (p1.x - p0.x) / 3;
      const cpY1 = p0.y;
      const cpX2 = p0.x + 2 * (p1.x - p0.x) / 3;
      const cpY2 = p1.y;
      path += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
    }
    return path;
  };

  const primaryLinePath = getDynamicBezierPath(revenuePoints);
  const primarySplinePath = `${primaryLinePath} L 450 150 L 0 150 Z`;

  const secondaryLinePath = getDynamicBezierPath(ordersPoints);
  const secondarySplinePath = `${secondaryLinePath} L 450 150 L 0 150 Z`;

  // ── 3. DYNAMIC CIRCULAR DONUT TRANSACTIONS CHART ──────────────────────────
  const completedOrders = rawOrders.filter(o => 
    o.orderStatus === 'DELIVERED' || 
    o.orderStatus === 'COMPLETED' || 
    o.orderStatus === 'Completed' || 
    o.orderStatus === 'Delivered'
  ).length;

  const pendingOrders = rawOrders.filter(o => 
    o.orderStatus === 'PENDING' || 
    o.orderStatus === 'Processing' || 
    o.orderStatus === 'AWAITING_PAYMENT'
  ).length;

  const cancelledOrders = rawOrders.filter(o => 
    o.orderStatus === 'CANCELLED' || 
    o.orderStatus === 'Cancelled' || 
    o.orderStatus === 'FAILED'
  ).length;

  const transactionSuccessRate = rawOrders.length > 0 
    ? Math.round((completedOrders / rawOrders.length) * 100) 
    : 100;

  const radius = 55;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (transactionSuccessRate / 100) * circumference;

  // ── 4. FILTER RECENT TRANSACTIONS BY SELECTED CALENDAR DATE ────────────────
  const getFilteredRecentOrders = () => {
    let list = [...rawOrders];
    
    if (calendarFilterDay) {
      const year = viewDate.getFullYear();
      const month = viewDate.getMonth();
      list = list.filter(o => {
        if (!o.createdAt) return false;
        const d = new Date(o.createdAt);
        return d.getFullYear() === year && 
               d.getMonth() === month && 
               d.getDate() === calendarFilterDay;
      });
    }

    // Return latest 4 matching records
    return list
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 4)
      .map(order => ({
        id: order.orderNumber || `#${order.id}`,
        customer: order.user?.fullName || order.userResponse?.fullName || 'N/A',
        date: order.createdAt ? new Date(order.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : 'N/A',
        total: order.totalPrice || 0,
        status: order.orderStatus || 'Processing',
        method: order.paymentMethod || 'N/A'
      }));
  };

  const recent = getFilteredRecentOrders();

  const handleCalendarDayClick = (dayItem) => {
    if (!dayItem.isCurrent || !dayItem.day) return;
    
    // Toggle calendar filter
    if (calendarFilterDay === dayItem.day) {
      setCalendarFilterDay(null);
    } else {
      setCalendarFilterDay(dayItem.day);
    }
  };

  // Navigates dynamic calendar viewer month backwards/forwards
  const handleMonthNavigate = (offset) => {
    setCalendarFilterDay(null); // Clear filter when moving months
    setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
  };

  // Reset Calendar instantly to current month and today
  const handleCalendarReset = () => {
    setCalendarFilterDay(null);
    setViewDate(new Date());
    showAlert('Đã thiết lập lại lịch về tháng hiện tại!', 'success');
  };

  return (
    <div className="bg-[#eef2f5] min-h-screen p-8 -mx-8 -my-10 space-y-8 text-zinc-800 font-sans">
      
      {/* Upper header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1c1c]">Dashboard User</h1>
        </div>
        <button className="text-zinc-600 hover:text-zinc-950">
          <span className="material-symbols-outlined text-2xl font-bold">menu</span>
        </button>
      </div>

      {/* Top 4 Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Card 1: Highlighted Earning */}
        <div className="bg-primary text-white rounded-xl p-6 shadow-md relative overflow-hidden flex flex-col justify-between h-[150px] hover:scale-[1.02] transition-all">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold tracking-wider opacity-85 uppercase">Earning</span>
            <div className="w-7 h-7 bg-white/10 rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-sm">payments</span>
            </div>
          </div>
          <div>
            <h2 className="text-4xl font-light font-space-grotesk tracking-wide mb-1">
              ${Math.round(stats.totalRevenue)}
            </h2>
          </div>
        </div>

        {/* Card 2: Total Orders */}
        <div className="bg-white text-zinc-950 rounded-xl p-6 shadow-sm flex flex-col justify-between h-[150px] border border-zinc-100 hover:scale-[1.02] transition-all">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-zinc-400 tracking-wider uppercase">Total Orders</span>
            <div className="w-7 h-7 bg-primary-container/10 text-primary-container rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-sm">shopping_cart</span>
            </div>
          </div>
          <div>
            <h2 className="text-4xl font-light text-zinc-950 font-space-grotesk tracking-wide mb-1">
              {stats.totalOrders}
            </h2>
          </div>
        </div>

        {/* Card 3: Active Users */}
        <div className="bg-white text-zinc-950 rounded-xl p-6 shadow-sm flex flex-col justify-between h-[150px] border border-zinc-100 hover:scale-[1.02] transition-all">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-zinc-400 tracking-wider uppercase">Active Users</span>
            <div className="w-7 h-7 bg-primary-container/10 text-primary-container rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-sm">group</span>
            </div>
          </div>
          <div>
            <h2 className="text-4xl font-light text-zinc-950 font-space-grotesk tracking-wide mb-1">
              {stats.activeUsers}
            </h2>
          </div>
        </div>

        {/* Card 4: Flash Sale Items */}
        <div className="bg-white text-zinc-950 rounded-xl p-6 shadow-sm flex flex-col justify-between h-[150px] border border-zinc-100 hover:scale-[1.02] transition-all">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-zinc-400 tracking-wider uppercase">Flash Sale Sold</span>
            <div className="w-7 h-7 bg-primary-container/10 text-primary-container rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-sm">bolt</span>
            </div>
          </div>
          <div>
            <h2 className="text-4xl font-light text-zinc-950 font-space-grotesk tracking-wide mb-1">
              {stats.flashSaleItems}
            </h2>
          </div>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (8 cols): Single Bar Chart + Double Spline Area Chart */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Card: Single Bar Chart ("Result") with Year Dropdown Filter */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-zinc-100">
            <div className="flex justify-between items-center mb-6">
              <div>
                <span className="text-sm font-bold text-[#1a1c1c]">Result (Doanh số bán hàng)</span>
              </div>
              
              {/* Premium Year Filter Dropdown */}
              <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-100 rounded-xl px-3 py-1.5">
                <span className="material-symbols-outlined text-zinc-400 text-xs">filter_alt</span>
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Năm:</label>
                <select 
                  value={selectedYear} 
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="bg-transparent text-xs font-bold text-zinc-700 outline-none cursor-pointer pr-1"
                >
                  {getAvailableYears().map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* SVG Bar Chart */}
            <div className="relative w-full h-[180px] mt-4 flex items-end">
              
              {/* Y Axis Gridlines */}
              <div className="absolute inset-0 flex flex-col justify-between py-2 pointer-events-none opacity-10">
                <div className="border-b border-zinc-950 w-full"></div>
                <div className="border-b border-zinc-950 w-full"></div>
                <div className="border-b border-zinc-950 w-full"></div>
                <div className="border-b border-zinc-950 w-full"></div>
                <div className="border-b border-zinc-950 w-full"></div>
              </div>

              {/* Bar Columns Container */}
              <div className="w-full h-full flex justify-between items-end px-4 z-10">
                {barChartData.map((d, idx) => {
                  const isActive = activeBarIndex === idx;

                  return (
                    <div 
                      key={idx} 
                      className="relative flex flex-col items-center flex-1 cursor-pointer group"
                      onMouseEnter={() => setActiveBarIndex(idx)}
                    >
                      
                      {/* Tooltip positioned perfectly above column */}
                      {isActive && (
                        <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-lg z-20 whitespace-nowrap">
                          {d.realCount !== undefined ? d.realCount : d.count} đơn
                        </div>
                      )}

                      <div className="flex items-end w-full justify-center h-[140px]">
                        
                        {/* Single Clean Bar (Primary-Container - Vivid Blue) */}
                        <div 
                          style={{ height: `${d.count}%` }} 
                          className={`w-5 rounded-t-md transition-all duration-300 ${
                            isActive ? 'bg-primary scale-x-110 shadow-lg' : 'bg-primary-container hover:bg-primary'
                          }`}
                        ></div>
                      </div>

                      {/* X label */}
                      <span className="text-[10px] text-zinc-400 font-bold mt-3 tracking-wider">{d.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Card: Double Spline Area Chart + Current-Month Mini Calendar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left Area Chart Sub-card */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-zinc-100 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary-container"></span>
                  <span className="text-xs font-bold text-zinc-500">Doanh thu ($) (Thực tế)</span>
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#585f6a]"></span>
                  <span className="text-xs font-bold text-zinc-500">Đơn hàng (SL) (Thực tế)</span>
                </div>
              </div>

              {/* Double Spline SVG container */}
              <div className="relative w-full h-[150px] overflow-hidden">
                <svg className="w-full h-full" viewBox="0 0 450 150" preserveAspectRatio="none">
                  {/* Gradients */}
                  <defs>
                    <linearGradient id="primaryGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0052ff" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#0052ff" stopOpacity="0.0" />
                    </linearGradient>
                    <linearGradient id="secondaryGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#585f6a" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#585f6a" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Overlapping Curved Areas */}
                  <path d={primarySplinePath} fill="url(#primaryGrad)" />
                  <path d={secondarySplinePath} fill="url(#secondaryGrad)" />

                  {/* Spline Lines */}
                  <path d={primaryLinePath} fill="none" stroke="#0052ff" strokeWidth="4.5" strokeLinecap="round" />
                  <path d={secondaryLinePath} fill="none" stroke="#585f6a" strokeWidth="4.5" strokeLinecap="round" />
                </svg>
              </div>
            </div>

            {/* Right Mini Calendar Sub-card */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-zinc-100 flex flex-col justify-between">
              
              {/* Calendar Header with navigation and dynamic month text */}
              <div className="flex justify-between items-center mb-4 border-b border-zinc-50 pb-2">
                <div className="flex items-center gap-1.5">
                  {/* Previous Month Arrow */}
                  <button 
                    onClick={() => handleMonthNavigate(-1)}
                    className="p-1 text-zinc-400 hover:text-zinc-900 rounded-md hover:bg-zinc-50 transition-all flex items-center"
                    title="Tháng trước"
                  >
                    <span className="material-symbols-outlined text-sm font-bold">chevron_left</span>
                  </button>
                  
                  {/* Dynamic Month/Year Label */}
                  <span className="text-xs font-bold text-zinc-900 uppercase tracking-wider min-w-[100px] text-center">
                    {viewDate.toLocaleString('vi-VN', { month: 'long', year: 'numeric' })}
                  </span>

                  {/* Next Month Arrow */}
                  <button 
                    onClick={() => handleMonthNavigate(1)}
                    className="p-1 text-zinc-400 hover:text-zinc-900 rounded-md hover:bg-zinc-50 transition-all flex items-center"
                    title="Tháng sau"
                  >
                    <span className="material-symbols-outlined text-sm font-bold">chevron_right</span>
                  </button>
                </div>

                {/* Dynamic Reset Icon: Return to Current Month and Today */}
                <button 
                  onClick={handleCalendarReset}
                  className="text-zinc-400 hover:text-primary transition-all flex items-center"
                  title="Về tháng hiện tại & xóa lọc"
                >
                  <span className="material-symbols-outlined text-sm">calendar_month</span>
                </button>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-y-2 text-center text-[10px]">
                {/* Weekday headers */}
                {weekDays.map((d, i) => (
                  <span key={i} className="font-bold text-zinc-300">{d}</span>
                ))}

                {/* Calendar monthly days */}
                {calendarDays.map((item, idx) => {
                  let cellClass = "w-6 h-6 flex items-center justify-center mx-auto rounded-full font-semibold transition-all ";
                  
                  if (!item.isCurrent) {
                    cellClass += "text-zinc-200";
                  } else if (item.isToday) {
                    cellClass += "border-2 border-primary-container text-zinc-800 font-bold hover:bg-zinc-100 cursor-pointer";
                  } else if (calendarFilterDay === item.day) {
                    cellClass += "bg-primary text-white font-bold shadow-md cursor-pointer";
                  } else if (item.hasOrders) {
                    cellClass += "bg-primary-container/15 text-primary font-bold hover:bg-primary-container/25 cursor-pointer";
                  } else {
                    cellClass += "text-zinc-500 hover:bg-zinc-100 cursor-pointer";
                  }

                  return (
                    <div key={idx} className="h-6 flex items-center justify-center">
                      <span 
                        onClick={() => handleCalendarDayClick(item)} 
                        className={cellClass}
                        title={item.hasOrders ? "Bấm để lọc đơn hàng ngày này" : ""}
                      >
                        {item.day}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols) Sidebar: Circular Progress / Donut chart */}
        <div className="lg:col-span-4 h-full">
          <div className="bg-white rounded-xl p-8 shadow-sm border border-zinc-100 flex flex-col justify-between items-center text-center h-full min-h-[460px]">
            
            {/* Donut Circle */}
            <div className="relative w-40 h-40 flex items-center justify-center">
              
              {/* Outer SVG donut wrapper */}
              <svg className="w-full h-full transform -rotate-90">
                {/* Background track circle */}
                <circle 
                  cx="80" 
                  cy="80" 
                  r={radius} 
                  fill="transparent" 
                  stroke="#dde1ff" 
                  strokeWidth={strokeWidth} 
                />
                {/* Filled foreground value circle */}
                <circle 
                  cx="80" 
                  cy="80" 
                  r={radius} 
                  fill="transparent" 
                  stroke="#0052ff" 
                  strokeWidth={strokeWidth} 
                  strokeDasharray={circumference} 
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                />
              </svg>

              {/* Absolute percentage text inside the donut */}
              <div className="absolute text-3xl font-light text-zinc-900 font-space-grotesk">
                {transactionSuccessRate}%
              </div>
            </div>

            {/* Details Bullet List */}
            <div className="w-full space-y-4 my-8 text-left max-w-[200px] mx-auto">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest border-b pb-1">Đơn hàng thực tế</p>
              <div className="flex items-center gap-3">
                <span className="w-3.5 h-3.5 rounded-full shrink-0 bg-primary-container"></span>
                <span className="text-xs font-semibold text-zinc-500 truncate tracking-wide">
                  Đã giao: {completedOrders}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-3.5 h-3.5 rounded-full shrink-0 bg-primary"></span>
                <span className="text-xs font-semibold text-zinc-500 truncate tracking-wide">
                  Chờ xử lý: {pendingOrders}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-3.5 h-3.5 rounded-full shrink-0 bg-secondary"></span>
                <span className="text-xs font-semibold text-zinc-500 truncate tracking-wide">
                  Đã hủy: {cancelledOrders}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-3.5 h-3.5 rounded-full shrink-0 bg-zinc-300"></span>
                <span className="text-xs font-semibold text-zinc-500 truncate tracking-wide">
                  Tổng cộng: {rawOrders.length}
                </span>
              </div>
            </div>

            {/* Check now action button */}
            <button className="w-full bg-primary hover:bg-[#0033a8] text-white font-bold py-3.5 rounded-xl text-xs transition-all shadow-md mt-auto uppercase tracking-wider">
              Check Now
            </button>
          </div>
        </div>
      </div>

      {/* Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Orders Table (Now dynamically filtered by Calendar click!) */}
        <div className="lg:col-span-8 bg-white rounded-xl p-8 border border-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-bold font-space-grotesk text-zinc-900 uppercase">
                Giao dịch gần đây
              </h2>
              {calendarFilterDay && (
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                  <p className="text-[10px] text-primary font-black uppercase tracking-wider">
                    Đang lọc ngày {calendarFilterDay} {viewDate.toLocaleString('vi-VN', { month: 'long', year: 'numeric' })}
                  </p>
                  <button 
                    onClick={() => setCalendarFilterDay(null)}
                    className="text-[9px] font-black text-red-500 bg-red-50 hover:bg-red-100 px-2 py-0.5 rounded-md uppercase ml-2 tracking-widest transition-all"
                  >
                    Xóa lọc ✕
                  </button>
                </div>
              )}
            </div>
            <Link to="/admin/orders" className="text-xs font-black text-primary hover:underline uppercase tracking-wider">
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
                {recent.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-xs font-bold text-zinc-400 uppercase tracking-widest">
                      Không có giao dịch nào trong ngày này
                    </td>
                  </tr>
                ) : (
                  recent.map((order, idx) => (
                    <tr key={idx} className="group hover:bg-zinc-50/50 transition-colors">
                      <td className="py-4 font-bold text-zinc-900">{order.id}</td>
                      <td className="py-4">
                        <p className="font-bold text-zinc-900 text-sm">{order.customer}</p>
                        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">{order.date}</p>
                      </td>
                      <td className="py-4 font-black font-space-grotesk italic text-zinc-950">${order.total.toFixed(2)}</td>
                      <td className="py-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black tracking-widest ${
                          order.status === 'Delivered' || order.status === 'Completed' || order.status === 'COMPLETED' ? 'bg-green-50 text-green-600 border border-green-100' :
                          order.status === 'Processing' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                          order.status === 'In Transit' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                          'bg-red-50 text-red-600 border border-red-100'
                        }`}>
                          {order.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Server & IMDG Health Status */}
        <div className="lg:col-span-4 bg-white rounded-xl p-8 border border-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col justify-between">
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
