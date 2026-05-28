import React, { useState, useEffect } from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import ProductCard from '../components/common/ProductCard';
import TechBreakdown from '../components/sections/TechBreakdown';
import { flashSaleService } from '../services/flashSaleService';
import { productService } from '../services/productService';

const FlashSalePage = () => {
  const [activeCampaign, setActiveCampaign] = useState(null);
  const [upcomingCampaign, setUpcomingCampaign] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Timer state
  const [timeLeft, setTimeLeft] = useState({ hours: 0, mins: 0, secs: 0 });
  const [countdownLabel, setCountdownLabel] = useState('Chiến dịch kết thúc sau');
  const [isCampaignActive, setIsCampaignActive] = useState(false);

  // Real-time RAM stock levels
  const [realtimeStocks, setRealtimeStocks] = useState({});

  useEffect(() => {
    fetchCampaignStatus();
  }, []);

  const fetchCampaignStatus = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch catalog first to enrich flash sale products with images and details
      const catalogData = await productService.getAllProducts(0, 100);
      const catalog = catalogData.content || [];

      // 2. Get currently active campaign
      let active = null;
      try {
        active = await flashSaleService.getActiveCampaign();
      } catch (err) {
        console.log('No active flash sale campaign found.');
      }

      if (active) {
        setActiveCampaign(active);
        setIsCampaignActive(true);
        setUpcomingCampaign(null);
        
        // Enrich products
        const enriched = (active.products || []).map(p => {
          const match = catalog.find(c => (c.skuCode || String(c.id)) === p.productId);
          return {
            ...p,
            image: match?.image || match?.imageResponses?.[0]?.url || '',
            imageResponses: match?.imageResponses || [],
            category: match?.categoryName || match?.category || 'Performance',
            originalPrice: match?.price || 0
          };
        });
        setProducts(enriched);
      } else {
        // 3. If no active, search for the nearest upcoming/scheduled campaign
        const allCampaigns = await flashSaleService.getAllCampaigns();
        const now = Date.now();
        const nearestScheduled = allCampaigns
          .filter(c => c.status === 'SCHEDULED' && c.startTime > now)
          .sort((a, b) => a.startTime - b.startTime)[0];

        if (nearestScheduled) {
          setUpcomingCampaign(nearestScheduled);
          setIsCampaignActive(false);
          setActiveCampaign(null);
          
          // Enrich products
          const enriched = (nearestScheduled.products || []).map(p => {
            const match = catalog.find(c => (c.skuCode || String(c.id)) === p.productId);
            return {
              ...p,
              image: match?.image || match?.imageResponses?.[0]?.url || '',
              imageResponses: match?.imageResponses || [],
              category: match?.categoryName || match?.category || 'Performance',
              originalPrice: match?.price || 0
            };
          });
          setProducts(enriched);
        } else {
          // No active or upcoming campaigns
          setUpcomingCampaign(null);
          setActiveCampaign(null);
          setIsCampaignActive(false);
          setProducts([]);
        }
      }
    } catch (e) {
      console.error('Error fetching flash sale details:', e);
    } finally {
      setLoading(false);
    }
  };

  // Sync Timer based on Campaign state
  useEffect(() => {
    let targetTimeMillis = 0;
    
    if (isCampaignActive && activeCampaign) {
      targetTimeMillis = activeCampaign.endTime;
      setCountdownLabel('Sự kiện kết thúc trong');
    } else if (!isCampaignActive && upcomingCampaign) {
      targetTimeMillis = upcomingCampaign.startTime;
      setCountdownLabel('Mở bán cực sốc sau');
    } else {
      setTimeLeft({ hours: 0, mins: 0, secs: 0 });
      return;
    }

    const calculateTime = () => {
      const remainingSeconds = Math.max(0, Math.floor((targetTimeMillis - Date.now()) / 1000));
      
      if (remainingSeconds === 0) {
        // Trigger auto refresh status when countdown finishes!
        fetchCampaignStatus();
      }

      const h = Math.floor(remainingSeconds / 3600);
      const m = Math.floor((remainingSeconds % 3600) / 60);
      const s = remainingSeconds % 60;
      setTimeLeft({ hours: h, mins: m, secs: s });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [isCampaignActive, activeCampaign, upcomingCampaign]);

  // Poll RAM Stocks from Hazelcast Query side for active products
  useEffect(() => {
    if (products.length === 0 || !isCampaignActive) return;

    const fetchStocks = async () => {
      const stockUpdates = {};
      for (const product of products) {
        const prodKey = product.productId;
        try {
          const stockInfo = await flashSaleService.getRealtimeStock(prodKey);
          stockUpdates[prodKey] = stockInfo.currentStock;
        } catch (e) {
          stockUpdates[prodKey] = 0;
        }
      }
      setRealtimeStocks(prev => ({ ...prev, ...stockUpdates }));
    };

    fetchStocks();
    const interval = setInterval(fetchStocks, 3000); // Polling every 3 seconds
    return () => clearInterval(interval);
  }, [products, isCampaignActive]);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />

      <main className="flex-1 pt-20">
        {/* Premium Blue Banner Hero */}
        <section className="px-margin-mobile md:px-margin-desktop py-12">
          <div className="max-w-container-max mx-auto">
            <div className="bg-primary-container rounded-[48px] p-12 md:p-20 relative overflow-hidden flex flex-col md:flex-row justify-between items-center min-h-[450px]">

              <div className="relative z-10 max-w-xl text-center md:text-left">
                <span className="bg-white/20 backdrop-blur-md text-white text-[10px] px-5 py-2 rounded-full font-black uppercase tracking-[0.2em] mb-8 inline-block border border-white/10">
                  {isCampaignActive ? 'Limited Time Only' : 'Upcoming Event'}
                </span>
                <h2 className="text-white text-6xl md:text-[80px] font-space-grotesk font-black mb-8 leading-[0.8] italic uppercase tracking-tighter">
                  Flash <br className="hidden md:block" /> Sale
                </h2>
                <p className="text-white/80 text-xl leading-relaxed max-w-md">
                  {isCampaignActive 
                    ? `Chiến dịch "${activeCampaign?.name}" đang diễn ra sôi động! Săn ngay các mẫu giày hiệu với giá giảm cực sốc.`
                    : upcomingCampaign 
                      ? `Lên lịch săn deal cùng "${upcomingCampaign?.name}". Hãy chuẩn bị sẵn sàng cho giờ G!`
                      : 'Hiện tại chưa có đợt Flash Sale nào được kích hoạt. Hãy quay lại sau nhé!'}
                </p>
              </div>

              {/* Countdown & Shoe Container */}
              {(activeCampaign || upcomingCampaign) && (
                <div className="relative z-10 mt-12 md:mt-0 flex items-center justify-center">
                  {/* Countdown Card */}
                  <div className="bg-white/10 backdrop-blur-3xl border border-white/20 p-10 md:p-14 rounded-[40px] min-w-[340px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)]">
                    <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.3em] text-center mb-8">{countdownLabel}</p>
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
              )}

              {/* Decorative elements */}
              <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/5 rounded-full blur-[100px]"></div>
            </div>
          </div>
        </section>

        {/* Product Grid */}
        <section className="py-20 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto w-full">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-[350px] bg-zinc-50 animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : (
            <>
              {products.length === 0 ? (
                <div className="text-center py-24 bg-zinc-50 rounded-3xl border border-zinc-100/80 my-10 flex flex-col items-center justify-center">
                  <span className="material-symbols-outlined text-5xl text-zinc-300 mb-4 animate-bounce">bolt</span>
                  <p className="text-zinc-500 font-space-grotesk uppercase tracking-widest text-sm font-bold">Hiện tại chưa có đợt Flash Sale nào được kích hoạt</p>
                  <p className="text-zinc-400 text-xs mt-2">Vui lòng quay lại sau khi đợt mở bán bắt đầu!</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12 mb-32">
                  {products.map((p) => {
                    const mappedProduct = {
                      id: p.productId,
                      skuCode: p.productId,
                      name: p.name,
                      price: p.salePrice, // Show the configured discount Flash Sale Price!
                      oldPrice: p.originalPrice, // Original slashed price
                      image: p.image,
                      imageResponses: p.imageResponses,
                      categoryName: p.category,
                      stock: isCampaignActive ? (realtimeStocks[p.productId] !== undefined ? realtimeStocks[p.productId] : p.stock) : p.stock
                    };

                    return (
                      <div key={p.productId} className="relative group transition-all duration-500 hover:scale-[1.01]">
                        <ProductCard product={mappedProduct} isFlashSale={isCampaignActive} />
                        {/* Realtime RAM Stock Badge */}
                        <div className="absolute top-4 right-4 z-20">
                          {isCampaignActive ? (
                            <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase text-white shadow-lg tracking-wider ${mappedProduct.stock > 0 ? 'bg-green-600' : 'bg-red-500 animate-pulse'}`}>
                              RAM STOCK: {mappedProduct.stock}
                            </span>
                          ) : (
                            <span className="px-3 py-1.5 rounded-xl text-[9px] font-black uppercase text-zinc-700 bg-zinc-100 shadow-md tracking-wider">
                              Sắp mở bán: {mappedProduct.stock} đôi
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
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
