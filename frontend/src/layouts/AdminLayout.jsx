import React, { useEffect, useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAlert } from '../contexts/AlertContext';
import { notificationService } from '../services/notificationService';

const AdminNotificationBell = () => {
  const [notifications, setNotifications] = useState(notificationService.getAdminNotifications());
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    return notificationService.subscribe(() => {
      setNotifications(notificationService.getAdminNotifications());
    });
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative">
      <button 
        onClick={() => {
          setIsOpen(!isOpen);
          notificationService.markAdminAllAsRead();
        }}
        className="material-symbols-outlined text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 p-2 rounded-full transition-all relative flex items-center justify-center border border-zinc-100"
      >
        notifications
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-primary-container rounded-full border-2 border-white flex items-center justify-center text-[7px] text-white font-bold animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full pt-2 z-[200]">
          <div className="bg-white border border-zinc-100 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] min-w-[320px] max-w-[360px] p-4 overflow-hidden text-left">
            <div className="flex justify-between items-center mb-3 pb-2 border-b border-zinc-50">
              <span className="text-xs font-black uppercase tracking-wider text-zinc-900 font-space-grotesk">Hệ thống thông báo</span>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-[10px] font-bold text-zinc-400 hover:text-zinc-900 uppercase tracking-widest"
              >
                Đóng
              </button>
            </div>
            <div className="space-y-3 max-h-[280px] overflow-y-auto no-scrollbar">
              {notifications.length > 0 ? (
                notifications.map(n => (
                  <div key={n.id} className={`p-3 rounded-xl border transition-all ${n.read ? 'bg-zinc-50/50 border-zinc-100/30' : 'bg-primary-container/5 border-primary-container/10'}`}>
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-[10px] font-black text-zinc-950 uppercase leading-snug">{n.title}</span>
                      <span className="text-[8px] text-zinc-400 font-bold shrink-0">{n.time}</span>
                    </div>
                    <p className="text-xs text-zinc-500 leading-tight mt-1">{n.message}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-zinc-400 text-xs font-bold uppercase tracking-wider">Không có thông báo mới</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const AdminLayout = () => {
  const { user, logout, isLoggedIn, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { showAlert } = useAlert();

  // Route guarding: only allow users with ADMIN role
  useEffect(() => {
    if (!loading) {
      const role = localStorage.getItem('role');
      if (!isLoggedIn || (role !== 'ADMIN' && role !== 'ROLE_ADMIN')) {
        showAlert('Bạn không có quyền truy cập trang quản trị!', 'error');
        navigate('/login');
      }
    }
  }, [isLoggedIn, loading, navigate, showAlert]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-container"></div>
      </div>
    );
  }

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: 'dashboard' },
    { name: 'Products', path: '/admin/products', icon: 'app_registration' },
    { name: 'Categories', path: '/admin/categories', icon: 'category' },
    { name: 'Users', path: '/admin/users', icon: 'group' },
    { name: 'Orders', path: '/admin/orders', icon: 'shopping_bag' },
    { name: 'Comments', path: '/admin/comments', icon: 'forum' },
    { name: 'Flash Sale', path: '/admin/flash-sale', icon: 'bolt' },
  ];

  const getBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(x => x);
    return paths.map((path, idx) => {
      const routeTo = `/${paths.slice(0, idx + 1).join('/')}`;
      const isLast = idx === paths.length - 1;
      const label = path.charAt(0).toUpperCase() + path.slice(1).replace('-', ' ');
      return (
        <span key={routeTo} className="flex items-center gap-1 text-xs">
          <span className="text-zinc-300">/</span>
          {isLast ? (
            <span className="font-bold text-zinc-900">{label}</span>
          ) : (
            <Link to={routeTo} className="text-zinc-400 hover:text-zinc-900 transition-colors uppercase tracking-wider font-bold">
              {label}
            </Link>
          )}
        </span>
      );
    });
  };

  const handleLogout = () => {
    logout();
    showAlert('Đã đăng xuất tài khoản Admin!', 'success');
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-zinc-50/50 font-body-md overflow-hidden">
      {/* Sidebar */}
      <aside className="w-80 bg-zinc-900 text-white flex flex-col justify-between p-8 z-20 shadow-[8px_0_30px_rgba(0,0,0,0.05)]">
        <div>
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">
            <span className="text-2xl font-black italic tracking-widest font-space-grotesk">AERO.CTRL</span>
            <span className="bg-primary-container text-white text-[8px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider">
              ADMIN
            </span>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-2">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-4 px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                    isActive
                      ? 'bg-primary-container text-white shadow-[0_10px_25px_-5px_rgba(0,82,255,0.4)]'
                      : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50'
                  }`}
                >
                  <span className="material-symbols-outlined text-lg">{item.icon}</span>
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="space-y-4 pt-6 border-t border-zinc-800">
          <Link
            to="/"
            className="flex items-center gap-4 px-6 py-3 rounded-xl text-xs font-bold text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/30 transition-all"
          >
            <span className="material-symbols-outlined text-lg">storefront</span>
            Back to Store
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-6 py-3 rounded-xl text-xs font-bold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all text-left"
          >
            <span className="material-symbols-outlined text-lg">logout</span>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-20 bg-white border-b border-zinc-100 z-10 shrink-0">
          <div className="max-w-[1400px] mx-auto w-full h-full flex items-center justify-between px-10">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-zinc-400 text-sm">home</span>
              <Link to="/admin" className="text-xs text-zinc-400 hover:text-zinc-900 uppercase tracking-wider font-bold">
                Admin
              </Link>
              {getBreadcrumbs()}
            </div>

            {/* Admin User Status */}
            <div className="flex items-center gap-6">
              <AdminNotificationBell />
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs font-black text-zinc-950 font-space-grotesk">{user?.name || user?.email || 'Administrator'}</p>
                  <p className="text-[10px] text-primary-container font-black uppercase tracking-widest">Global Admin</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-primary-container/10 text-primary-container flex items-center justify-center font-black font-space-grotesk text-sm border border-primary-container/20 shadow-sm">
                  {(user?.name || user?.email || 'A').charAt(0).toUpperCase()}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content View */}
        <main className="flex-1 overflow-y-auto bg-zinc-50/50 p-10">
          <div className="max-w-[1400px] mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
