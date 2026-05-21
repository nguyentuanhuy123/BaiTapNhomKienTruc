import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../common/Button';
import ProductCard from '../common/ProductCard';
import { productService } from '../../services/productService';

const FlashSale = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFlashSaleProducts = async () => {
      try {
        const data = await productService.getAllProducts(0, 20);
        // Lọc ra các sản phẩm đang giảm giá để hiện ở mục Flash Sale
        const flashSaleItems = data.content.filter(p => p.discountPercentage > 0 || p.oldPrice > 0);
        setProducts(flashSaleItems.slice(0, 3)); // Chỉ lấy 3 sản phẩm đầu tiên cho landing page
      } catch (error) {
        console.error('Failed to fetch flash sale products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFlashSaleProducts();
  }, []);

  return (
    <section className="py-section-gap px-margin-mobile md:px-margin-desktop relative overflow-hidden bg-[#FF3B30]/5">
      <div className="max-w-container-max mx-auto relative z-10">
        {/* New Blue Banner Header */}
        <div className="bg-primary-container rounded-[40px] p-10 md:p-14 mb-16 relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-10">
          {/* Background Silhouette Shoe */}
          <div className="absolute right-0 top-0 h-full w-2/3 pointer-events-none opacity-20 transform translate-x-1/4 scale-125">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDlNG2P_20pGAAH4lD1LeB5XUPjnnrFc1Iqelb0yK_m5pU8LBE-r1o2Qc0s98A3ibTFLgTBWkOL_Of5_oOH0uULbeky0x39_KUNX_WWNODTJMDKHAAG_xht_x1U0gWH71RRXbW_ZtO1ozzj1yI-3cDWy7ha4kOLfSxqzcFYN7BgdKbZ3lfnDHt2k0E7f0EimKNABOUGiiHM7MyaiARflxSGkXj5a0rOM8LI-ylmoHgcPxKHEJvRV5XyWWxtRcZzNNk7Ff5qopsRjeM"
              alt="Silhouette"
              className="h-full w-full object-contain mix-blend-overlay"
            />
          </div>

          <div className="relative z-10 max-w-lg">
            <span className="bg-white/20 backdrop-blur-md text-white text-[10px] px-4 py-1.5 rounded-full font-bold uppercase tracking-widest mb-6 inline-block border border-white/10">
              Limited Time Only
            </span>
            <h2 className="text-white text-5xl md:text-6xl font-space-grotesk font-black mb-6 leading-none italic uppercase">Flash Sale</h2>
            <p className="text-white/80 text-lg leading-relaxed">
              Our highest performance silhouettes at their lowest prices ever.
              <span className="text-white font-bold italic"> Engineered for speed, priced for now.</span>
            </p>
          </div>

          {/* Glassmorphism Countdown Box */}
          <div className="relative z-10 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[32px] p-8 md:p-10 flex flex-col items-center min-w-[320px] shadow-2xl">
            <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.3em] mb-8">Sale Ends In</p>
            <div className="flex items-center gap-6">
              {[
                { val: '04', label: 'HOURS' },
                { val: '22', label: 'MINS' },
                { val: '15', label: 'SECS' }
              ].map((t, i) => (
                <React.Fragment key={i}>
                  <div className="flex flex-col items-center">
                    <span className="text-white text-4xl md:text-5xl font-black font-space-grotesk italic mb-2 tracking-tighter">{t.val}</span>
                    <span className="text-white/40 text-[8px] font-black uppercase tracking-widest">{t.label}</span>
                  </div>
                  {i < 2 && <span className="text-white/20 text-3xl font-black mb-6">:</span>}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter mb-12">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-[400px] bg-white/50 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter mb-12">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
            {products.length === 0 && (
              <p className="col-span-full text-center text-secondary py-20 font-space-grotesk uppercase tracking-widest opacity-50">No flash sale items at the moment</p>
            )}
          </div>
        )}

        <div className="text-center">
          <Link to="/flash-sale">
            <Button variant="outline">View All Flash Deals</Button>
          </Link>
        </div>
      </div>

      {/* Decorative Orbs */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary-container/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-primary-container/10 rounded-full blur-3xl"></div>
      </div>
    </section>
  );
};

export default FlashSale;
