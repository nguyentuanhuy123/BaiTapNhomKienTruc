import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, useScroll, useSpring } from 'framer-motion';
import authApi from '../../api/authApi';
import { useAuth } from '../../contexts/AuthContext';
import { notificationService } from '../../services/notificationService';

const UserNotificationBell = () => {
  const [notifications, setNotifications] = useState(notificationService.getUserNotifications());
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    return notificationService.subscribe(() => {
      setNotifications(notificationService.getUserNotifications());
    });
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative">
      <button 
        onClick={() => {
          setIsOpen(!isOpen);
          notificationService.markUserAllAsRead();
        }}
        className="material-symbols-outlined text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100/50 p-2.5 rounded-full transition-all relative flex items-center justify-center"
      >
        notifications
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-[7px] text-white font-bold animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full pt-2 z-[200]">
          <div className="bg-white border border-zinc-100 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] min-w-[320px] max-w-[360px] p-4 overflow-hidden">
            <div className="flex justify-between items-center mb-3 pb-2 border-b border-zinc-50">
              <span className="text-xs font-black uppercase tracking-wider text-zinc-900 font-space-grotesk">Thông báo của bạn</span>
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
                  <div key={n.id} className={`p-3 rounded-xl border transition-all text-left ${n.read ? 'bg-zinc-50/50 border-zinc-100/30' : 'bg-blue-50/20 border-blue-100/40'}`}>
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-[10px] font-black text-zinc-950 uppercase leading-snug">{n.title}</span>
                      <span className="text-[8px] text-zinc-400 font-bold shrink-0">{n.time}</span>
                    </div>
                    <p className="text-xs text-zinc-500 leading-tight mt-1">{n.message}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-zinc-400 text-xs font-bold uppercase tracking-wider">Không có thông báo nào</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn, logout } = useAuth();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const [cartCount, setCartCount] = useState(0);

  const updateCartCount = () => {
    try {
      const raw = localStorage.getItem("cart");
      if (raw) {
        const cart = JSON.parse(raw);
        const count = cart.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
        setCartCount(count);
      } else {
        setCartCount(0);
      }
    } catch {
      setCartCount(0);
    }
  };

  useEffect(() => {
    updateCartCount();
    window.addEventListener("cartUpdated", updateCartCount);
    // Listen to storage events (e.g. from other tabs)
    window.addEventListener("storage", updateCartCount);
    return () => {
      window.removeEventListener("cartUpdated", updateCartCount);
      window.removeEventListener("storage", updateCartCount);
    };
  }, []);

  // Hiệu ứng thanh progress bar từ nhánh develop
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Logic Logout từ nhánh feature
  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await authApi.logout(refreshToken);
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      logout();
      navigate('/');
    }
  };

  const navLinks = [
    { name: 'SHOP', path: '/' },
    { name: 'EXPLORE', path: '/explore' },
    { name: 'FLASH SALE', path: '/flash-sale' },
    { name: 'ATHLETES', path: '/athletes' },
    { name: 'TECH', path: '/technology' },
  ];

  return (
    <>
      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[2px] bg-blue-600 origin-left z-[1001]"
        style={{ scaleX }}
      />

      <nav className={`fixed top-0 w-full z-[1000] transition-all duration-500 ${
        (isScrolled || location.pathname !== '/')
          ? 'bg-white/90 backdrop-blur-2xl py-3 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-b border-zinc-100' 
          : 'bg-transparent py-5'
      }`}>
        <div className="flex justify-between items-center px-6 md:px-12 max-w-[1600px] mx-auto">
          
          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden p-2 text-zinc-900"
          >
            <span className="material-symbols-outlined text-2xl">menu</span>
          </button>

          {/* Logo Area */}
          <Link to="/" className="flex items-center group">
            <img 
              src="/logo.png" 
              alt="AERO-TECH" 
              className={`transition-all duration-500 ${isScrolled ? 'h-8' : 'h-10'} w-auto object-contain group-hover:scale-105`} 
            />
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="relative group py-1"
              >
                <span className={`font-space-grotesk font-black text-[13px] tracking-widest transition-colors duration-300 ${
                  location.pathname === link.path ? 'text-blue-600' : 'text-zinc-500 group-hover:text-zinc-900'
                }`}>
                  {link.name}
                </span>
                <span className={`absolute bottom-0 left-0 w-full h-[1.5px] bg-blue-600 transition-transform duration-500 origin-left ${
                  location.pathname === link.path ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                }`} />
              </Link>
            ))}
          </div>

          {/* Actions - Kết hợp Icon và Dropdown User */}
          <div className="flex items-center gap-1 md:gap-4">
            <Link to="/explore" className="p-2.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100/50 rounded-full transition-all">
              <span className="material-symbols-outlined text-[22px]">search</span>
            </Link>
            <Link to="/cart" className="p-2.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100/50 rounded-full transition-all relative flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">shopping_cart</span>
              {cartCount > 0 && (
                <span 
                  className="absolute top-1.5 right-1.5 bg-blue-600 text-white rounded-full border-2 border-white flex items-center justify-center text-[9px] font-black font-space-grotesk shadow-md"
                  style={{ width: '18px', height: '18px', minWidth: '18px', minHeight: '18px' }}
                >
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Notification Bell Dropdown */}
            {isLoggedIn && (
              <UserNotificationBell />
            )}

            {/* Dropdown User Profile từ nhánh feature */}
            <div className="relative group">
              <button className="material-symbols-outlined text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100/50 p-2.5 rounded-full transition-all">
                person
              </button>
              
              <div className="absolute right-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-[100]">
                <div className="bg-white border border-zinc-100 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] min-w-[180px] p-2 overflow-hidden">
                  {isLoggedIn ? (
                    <>
                      <Link to="/profile" className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 rounded-xl transition-all">
                        <span className="material-symbols-outlined text-lg">account_circle</span>
                        Profile
                      </Link>
                      <Link to="/wishlist" className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 rounded-xl transition-all">
                        <span className="material-symbols-outlined text-lg">favorite</span>
                        Wishlist
                      </Link>
                      <Link to="/orders" className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 rounded-xl transition-all">
                        <span className="material-symbols-outlined text-lg">receipt_long</span>
                        Orders
                      </Link>
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <span className="material-symbols-outlined text-lg">logout</span>
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link to="/login" className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 rounded-xl transition-all">
                        <span className="material-symbols-outlined text-lg">login</span>
                        Login
                      </Link>
                      <Link to="/register" className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 rounded-xl transition-all">
                        <span className="material-symbols-outlined text-lg">person_add</span>
                        Register
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay từ nhánh develop */}
      <div 
        className={`fixed inset-0 bg-white z-[9999] transition-all duration-700 ease-in-out md:hidden ${
          isMobileMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
        }`}
      >
        <div className="flex flex-col h-full p-8">
          <div className="flex justify-between items-center mb-16">
            <img src="/logo.png" alt="AERO-TECH" className="h-8 w-auto" />
            <button onClick={() => setIsMobileMenuOpen(false)} className="p-2">
              <span className="material-symbols-outlined text-3xl">close</span>
            </button>
          </div>

          <div className="flex flex-col gap-8">
            {navLinks.map((link, idx) => (
              <motion.div
                key={link.name}
                initial={{ opacity: 0, x: -20 }}
                animate={isMobileMenuOpen ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: idx * 0.1 }}
              >
                <Link
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`text-4xl font-black font-space-grotesk tracking-tighter ${
                    location.pathname === link.path ? 'text-blue-600' : 'text-zinc-900'
                  }`}
                >
                  {link.name}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;