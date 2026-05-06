import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-zinc-950 text-white w-full pt-20 pb-10 mt-auto overflow-hidden relative">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="container mx-auto px-6 md:px-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
          
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="inline-block mb-8">
              <img src="/logo.png" alt="AERO-TECH" className="h-10 w-auto brightness-200" />
            </Link>
            <p className="text-zinc-500 text-sm leading-relaxed mb-8 max-w-xs">
              Redefining human performance through cutting-edge aerodynamic engineering and advanced material science.
            </p>
            <div className="flex gap-4">
              {['facebook', 'instagram', 'twitter', 'youtube'].map((social) => (
                <a key={social} href="#" className="w-10 h-10 rounded-full border border-zinc-800 flex items-center justify-center hover:border-blue-500 hover:text-blue-500 transition-all duration-300">
                  <i className={`fab fa-${social} text-sm`}></i>
                </a>
              ))}
            </div>
          </div>

          {/* Links Sections */}
          <div>
            <h4 className="font-space-grotesk font-black text-xs uppercase tracking-[0.2em] mb-8 text-zinc-300">Shop</h4>
            <ul className="space-y-4">
              {['New Arrivals', 'Explore All', 'Flash Sale', 'Collections'].map((item) => (
                <li key={item}>
                  <Link to="/explore" className="text-zinc-500 hover:text-white transition-colors text-sm font-medium">{item}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-space-grotesk font-black text-xs uppercase tracking-[0.2em] mb-8 text-zinc-300">Company</h4>
            <ul className="space-y-4">
              {['About Us', 'Athletes', 'Technology', 'Careers'].map((item) => (
                <li key={item}>
                  <Link to="/athletes" className="text-zinc-500 hover:text-white transition-colors text-sm font-medium">{item}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-space-grotesk font-black text-xs uppercase tracking-[0.2em] mb-8 text-zinc-300">Newsletter</h4>
            <p className="text-zinc-500 text-sm mb-6">Stay ahead of the curve. Get early access to drops.</p>
            <div className="relative">
              <input 
                type="email" 
                placeholder="EMAIL ADDRESS" 
                className="w-full bg-zinc-900 border-none px-6 py-4 rounded-xl text-xs font-black tracking-widest focus:ring-2 focus:ring-blue-500 transition-all"
              />
              <button className="absolute right-2 top-2 bottom-2 bg-blue-600 hover:bg-blue-500 text-white px-4 rounded-lg transition-colors">
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-10 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex gap-8 order-2 md:order-1">
            <a href="#" className="text-zinc-600 hover:text-zinc-400 text-[10px] font-black uppercase tracking-widest">Privacy Policy</a>
            <a href="#" className="text-zinc-600 hover:text-zinc-400 text-[10px] font-black uppercase tracking-widest">Terms of Service</a>
          </div>
          <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.3em] order-1 md:order-2">
            © 2024 VELOCITY FOOTWEAR. ALL RIGHTS RESERVED.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
