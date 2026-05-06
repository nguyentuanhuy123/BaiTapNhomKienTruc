import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

const NotFoundPage = () => {
  const quickLinks = [
    {
      title: "New Arrivals",
      desc: "Discover our latest engineering marvels.",
      icon: "trending_up",
      path: "/explore"
    },
    {
      title: "Order Tracking",
      desc: "Find out where your speed is heading.",
      icon: "map",
      path: "/orders"
    },
    {
      title: "Pro Stories",
      desc: "Read how athletes redefine their limits.",
      icon: "stars",
      path: "/athletes"
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />

      <main className="flex-1 flex flex-col items-center pt-32 pb-20 px-6">
        {/* Hero 404 Image Section */}
        <div className="relative mb-12 group">
          <div className="w-[300px] h-[300px] md:w-[450px] md:h-[450px] bg-zinc-50 rounded-[40px] overflow-hidden transform rotate-[-6deg] shadow-2xl transition-transform duration-700 group-hover:rotate-0">
            <img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDlNG2P_20pGAAH4lD1LeB5XUPjnnrFc1Iqelb0yK_m5pU8LBE-r1o2Qc0s98A3ibTFLgTBWkOL_Of5_oOH0uULbeky0x39_KUNX_WWNODTJMDKHAAG_xht_x1U0gWH71RRXbW_ZtO1ozzj1yI-3cDWy7ha4kOLfSxqzcFYN7BgdKbZ3lfnDHt2k0E7f0EimKNABOUGiiHM7MyaiARflxSGkXj5a0rOM8LI-ylmoHgcPxKHEJvRV5XyWWxtRcZzNNk7Ff5qopsRjeM" 
              alt="404 Shoe" 
              className="w-full h-full object-contain scale-110"
            />
          </div>
          
          {/* Floating Badges */}
          <div className="absolute top-4 -right-8 bg-primary-container text-white px-6 py-2 rounded-full font-black text-xs uppercase tracking-widest shadow-xl transform rotate-12">
            Error 404
          </div>
          <div className="absolute bottom-12 -left-12 bg-white text-primary-container border border-zinc-100 px-6 py-2 rounded-full font-black text-xs uppercase tracking-widest shadow-xl transform -rotate-12">
            Pace Lost
          </div>
        </div>

        {/* Content Section */}
        <div className="text-center max-w-xl mb-16">
          <h1 className="text-3xl md:text-4xl font-space-grotesk font-black text-zinc-900 mb-6 uppercase italic tracking-tight">
            Losing your pace?
          </h1>
          <p className="text-zinc-500 font-medium leading-relaxed mb-10">
            This page doesn't exist. It looks like this route took a detour from the main track. Let's get you back in motion.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              to="/" 
              className="bg-primary-container text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-105 transition-all shadow-lg"
            >
              <span className="material-symbols-outlined text-sm">shopping_cart</span>
              Back to Shop
            </Link>
            <button className="bg-zinc-100 text-zinc-600 px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-zinc-200 transition-all">
              <span className="material-symbols-outlined text-sm">help</span>
              Get Support
            </button>
          </div>
        </div>

        {/* Quick Links Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
          {quickLinks.map((link, idx) => (
            <Link 
              key={idx} 
              to={link.path}
              className="bg-zinc-50/50 border border-zinc-100 p-8 rounded-[32px] hover:bg-white hover:shadow-xl transition-all group"
            >
              <span className="material-symbols-outlined text-primary-container mb-6 block text-2xl group-hover:scale-110 transition-transform">{link.icon}</span>
              <h3 className="font-black text-zinc-900 uppercase italic mb-3 tracking-tight">{link.title}</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">{link.desc}</p>
            </Link>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NotFoundPage;
