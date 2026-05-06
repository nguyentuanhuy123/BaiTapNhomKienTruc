import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import authApi from '../../api/authApi';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn, logout } = useAuth();

  // 2. Cập nhật hàm handleLogout thành hàm async
  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (refreshToken) {
        // Gọi API logout để xóa session phía Backend
        await authApi.logout(refreshToken);
      }
    } catch (error) {
      // Ngay cả khi API lỗi (ví dụ token hết hạn), chúng ta vẫn nên cho user logout ở client
      console.error("Logout error:", error);
    } finally {
      // 3. Xóa sạch dữ liệu ở Local Storage bất kể API thành công hay thất bại
      logout()
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
    <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-zinc-200">
      <div className="flex justify-between items-center h-20 px-8 max-w-[1440px] mx-auto">
        <Link to="/" className="text-2xl font-black italic text-zinc-900 tracking-widest font-space-grotesk">AERO-TECH</Link>
        
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`font-space-grotesk font-bold uppercase tracking-tighter transition-all ${
                location.pathname === link.path 
                  ? 'text-blue-600 border-b-2 border-blue-600 pb-1' 
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-6">
          <Link to="/cart" className="material-symbols-outlined text-zinc-900 hover:bg-zinc-100 p-2 rounded-full transition-all duration-200">shopping_cart</Link>
          
          <div className="relative group">
            <button className="material-symbols-outlined text-zinc-900 hover:bg-zinc-100 p-2 rounded-full transition-all duration-200 block">
              person
            </button>
            
            <div className="absolute right-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-[100]">
              <div className="bg-white/80 backdrop-blur-xl border border-zinc-100 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] min-w-[180px] p-2 overflow-hidden">
                
                {isLoggedIn ? (
                  <>
                    <Link to="/profile" className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 rounded-xl transition-all">
                      <span className="material-symbols-outlined text-lg">account_circle</span>
                      Profile
                    </Link>
                    {/* Nút Logout gọi hàm handleLogout đã cập nhật */}
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
  );
};

export default Navbar;