import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, useScroll, useSpring } from 'framer-motion';

const Navbar = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

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
                {/* Animated Underline */}
                <span className={`absolute bottom-0 left-0 w-full h-[1.5px] bg-blue-600 transition-transform duration-500 origin-left ${
                  location.pathname === link.path ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                }`} />
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 md:gap-4">
            {[
              { icon: 'search', path: '/explore' },
              { icon: 'favorite', path: '/wishlist' },
              { icon: 'shopping_cart', path: '/cart' },
              { icon: 'person', path: '/profile' }
            ].map((item, idx) => (
              <Link 
                key={idx} 
                to={item.path} 
                className="p-2.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100/50 rounded-full transition-all duration-300"
              >
                <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
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
