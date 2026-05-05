import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const navLinks = [
    { name: 'SHOP', path: '/' },
    { name: 'EXPLORE', path: '/explore' },
    { name: 'FLASH SALE', path: '/flash-sale' },
    { name: 'ATHLETES', path: '/athletes' },
    { name: 'TECH', path: '/technology' },
  ];

  return (
    <>
      <nav className="fixed top-0 w-full z-[100] bg-white/80 backdrop-blur-md border-b border-zinc-200">
        <div className="flex justify-between items-center h-20 px-4 md:px-8 max-w-[1440px] mx-auto">
          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden material-symbols-outlined text-zinc-900 p-2 hover:bg-zinc-100 rounded-full transition-all"
          >
            menu
          </button>

          <Link to="/" className="text-xl md:text-2xl font-black italic text-zinc-900 tracking-widest font-space-grotesk">AERO-TECH</Link>
          
          {/* Desktop Links */}
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

          <div className="flex items-center gap-2 md:gap-6">
            <Link to="/cart" className="material-symbols-outlined text-zinc-900 hover:bg-zinc-100 p-2 rounded-full transition-all duration-200">shopping_cart</Link>
            
            {/* User Account Dropdown */}
            <div className="relative group">
              <button className="material-symbols-outlined text-zinc-900 hover:bg-zinc-100 p-2 rounded-full transition-all duration-200 block">
                person
              </button>
              
              {/* Dropdown Menu (Desktop) */}
              <div className="absolute right-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-[100]">
                <div className="bg-white/80 backdrop-blur-xl border border-zinc-100 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] min-w-[180px] p-2 overflow-hidden">
                  <Link to="/profile" className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 rounded-xl transition-all">
                    <span className="material-symbols-outlined text-lg">account_circle</span>
                    Profile
                  </Link>
                  <Link to="/login" className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 rounded-xl transition-all">
                    <span className="material-symbols-outlined text-lg">login</span>
                    Login
                  </Link>
                  <Link to="/register" className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 rounded-xl transition-all border-b border-zinc-50">
                    <span className="material-symbols-outlined text-lg">person_add</span>
                    Register
                  </Link>
                  <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-error hover:bg-error/5 rounded-xl transition-all">
                    <span className="material-symbols-outlined text-lg">logout</span>
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay - SEPARATED FROM NAV TAG */}
      <div 
        className={`fixed inset-0 bg-white z-[9999] transition-all duration-500 ease-in-out md:hidden ${
          isMobileMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
        }`}
        style={{ backgroundColor: 'white' }}
      >
        <div className="flex flex-col h-full">
          {/* Mobile Menu Header */}
          <div className="flex justify-between items-center h-20 px-4 border-b border-zinc-100">
            <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="text-xl font-black italic text-zinc-900 tracking-widest font-space-grotesk">AERO-TECH</Link>
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="material-symbols-outlined text-zinc-900 p-2 hover:bg-zinc-100 rounded-full transition-all"
            >
              close
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`p-4 rounded-2xl font-space-grotesk font-black text-2xl uppercase italic tracking-tighter transition-all ${
                  location.pathname === link.path 
                    ? 'bg-primary-container text-white shadow-lg' 
                    : 'text-zinc-900 hover:bg-zinc-50'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="p-10 text-center border-t border-zinc-50">
            <p className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.3em]">Velocity Footwear © 2024</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
