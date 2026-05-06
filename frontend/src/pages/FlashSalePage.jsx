import React, { useState, useEffect } from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import ProductCard from '../components/common/ProductCard';
import TechBreakdown from '../components/sections/TechBreakdown';
import { productService } from '../services/productService';

const FlashSalePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState({ hours: 4, mins: 22, secs: 15 });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const PAGE_SIZE = 8;

  useEffect(() => {
    const fetchFlashSaleProducts = async () => {
      try {
        setLoading(true);
        const data = await productService.getFlashSaleProducts(currentPage, PAGE_SIZE);
        setProducts(data.content || []);
        setTotalPages(data.totalPages || 0);
      } catch (error) {
        console.error('Failed to fetch flash sale products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFlashSaleProducts();
  }, [currentPage]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { hours, mins, secs } = prev;
        if (secs > 0) secs--;
        else if (mins > 0) { mins--; secs = 59; }
        else if (hours > 0) { hours--; mins = 59; secs = 59; }
        return { hours, mins, secs };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />

      <main className="flex-1 pt-20">
        {/* Premium Blue Banner Hero - Matched Exactly to Screenshot */}
        <section className="px-margin-mobile md:px-margin-desktop py-12">
          <div className="max-w-container-max mx-auto">
            <div className="bg-primary-container rounded-[48px] p-12 md:p-20 relative overflow-hidden flex flex-col md:flex-row justify-between items-center min-h-[450px]">

              <div className="relative z-10 max-w-xl text-center md:text-left">
                <span className="bg-white/20 backdrop-blur-md text-white text-[10px] px-5 py-2 rounded-full font-black uppercase tracking-[0.2em] mb-8 inline-block border border-white/10">
                  Limited Time Only
                </span>
                <h2 className="text-white text-6xl md:text-[100px] font-space-grotesk font-black mb-8 leading-[0.8] italic uppercase tracking-tighter">
                  Flash <br className="hidden md:block" /> Sale
                </h2>
                <p className="text-white/80 text-xl leading-relaxed max-w-md">
                  Our highest performance silhouettes at their lowest prices ever.
                  <span className="text-white font-black italic"> Engineered for speed, priced for now.</span>
                </p>
              </div>

              {/* Countdown & Shoe Container */}
              <div className="relative z-10 mt-12 md:mt-0 flex items-center justify-center">
                {/* Shoe Image behind timer */}
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDlNG2P_20pGAAH4lD1LeB5XUPjnnrFc1Iqelb0yK_m5pU8LBE-r1o2Qc0s98A3ibTFLgTBWkOL_Of5_oOH0uULbeky0x39_KUNX_WWNODTJMDKHAAG_xht_x1U0gWH71RRXbW_ZtO1ozzj1yI-3cDWy7ha4kOLfSxqzcFYN7BgdKbZ3lfnDHt2k0E7f0EimKNABOUGiiHM7MyaiARflxSGkXj5a0rOM8LI-ylmoHgcPxKHEJvRV5XyWWxtRcZzNNk7Ff5qopsRjeM"
                  alt="Shoe"
                  className="absolute -top-1/2 left-1/2 -translate-x-1/2 w-[140%] h-auto opacity-40 mix-blend-screen pointer-events-none transform -rotate-12"
                />

                {/* Countdown Card */}
                <div className="bg-white/10 backdrop-blur-3xl border border-white/20 p-10 md:p-14 rounded-[40px] min-w-[340px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)]">
                  <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.3em] text-center mb-8">Sale Ends In</p>
                  <div className="flex justify-between items-center gap-6">
                    <div className="text-center">
                      <span className="text-5xl md:text-6xl font-black text-white font-space-grotesk italic leading-none">{timeLeft.hours.toString().padStart(2, '0')}</span>
                      <p className="text-white/40 text-[9px] font-black uppercase tracking-widest mt-3">Hours</p>
                    </div>
                    <span className="text-white/20 text-5xl font-light mb-6">:</span>
                    <div className="text-center">
                      <span className="text-5xl md:text-6xl font-black text-white font-space-grotesk italic leading-none">{timeLeft.mins.toString().padStart(2, '0')}</span>
                      <p className="text-white/40 text-[9px] font-black uppercase tracking-widest mt-3">Mins</p>
                    </div>
                    <span className="text-white/20 text-5xl font-light mb-6">:</span>
                    <div className="text-center">
                      <span className="text-5xl md:text-6xl font-black text-white font-space-grotesk italic leading-none">{timeLeft.secs.toString().padStart(2, '0')}</span>
                      <p className="text-white/40 text-[9px] font-black uppercase tracking-widest mt-3">Secs</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/5 rounded-full blur-[100px]"></div>
            </div>
          </div>
        </section>

        {/* Product Grid */}
        <section className="py-20 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto w-full">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="h-[350px] bg-zinc-50 animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12 mb-32">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 0 && (
                <div className="mt-16 flex justify-center items-center gap-3">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                    disabled={currentPage === 0}
                    className={`w-10 h-10 flex items-center justify-center rounded-full border border-zinc-200 transition-all ${currentPage === 0 ? 'text-zinc-200 cursor-not-allowed' : 'text-zinc-400 hover:bg-zinc-50'}`}
                  >
                    <span className="material-symbols-outlined">chevron_left</span>
                  </button>

                  {[...Array(totalPages)].map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentPage(index)}
                      className={`w-10 h-10 flex items-center justify-center rounded-full font-bold transition-all ${currentPage === index ? 'bg-primary-container text-white' : 'hover:bg-zinc-100 text-zinc-500'}`}
                    >
                      {index + 1}
                    </button>
                  ))}

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                    disabled={currentPage === totalPages - 1}
                    className={`w-10 h-10 flex items-center justify-center rounded-full border border-zinc-200 transition-all ${currentPage === totalPages - 1 ? 'text-zinc-200 cursor-not-allowed' : 'text-zinc-400 hover:bg-zinc-50'}`}
                  >
                    <span className="material-symbols-outlined">chevron_right</span>
                  </button>
                </div>
              )}

              {products.length === 0 && (
                <div className="text-center py-20">
                  <p className="text-zinc-500 font-space-grotesk uppercase tracking-widest opacity-50">No flash sale items at the moment</p>
                </div>
              )}
            </>
          )}
        </section>

        {/* Tech Breakdown Section inside Flash Sale */}
        <TechBreakdown />
      </main>

      <Footer />
    </div>
  );
};

export default FlashSalePage;
