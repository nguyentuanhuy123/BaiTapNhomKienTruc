import React from 'react';
import { FLASH_SALE_PRODUCTS } from '../../constants/mockData';
import Button from '../common/Button';
import ProductCard from '../common/ProductCard';

const FlashSale = () => {
  return (
    <section className="py-section-gap px-margin-mobile md:px-margin-desktop relative overflow-hidden bg-[#FF3B30]/5">
      <div className="max-w-container-max mx-auto relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6 text-center md:text-left">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-error text-white text-label-sm rounded-full font-bold uppercase tracking-widest mb-4">
              <span className="material-symbols-outlined text-sm">bolt</span> Flash Sale
            </div>
            <h2 className="font-space-grotesk font-black text-headline-xl text-zinc-900 leading-none mb-2 uppercase">Limited Time Offers</h2>
          </div>
          
          <div className="px-8 py-4 rounded-xl ambient-shadow border bg-[#FF3B30] border-[#FF3B30]/20 shadow-[0_15px_30px_-5px_rgba(255,59,48,0.3)]">
            <p className="text-label-sm text-white/80 uppercase tracking-widest mb-1">Ending in:</p>
            <div className="font-space-grotesk font-bold text-headline-md text-white tracking-wider">
              02<span className="text-white/60 font-normal mx-1">h</span> 45<span className="text-white/60 font-normal mx-1">m</span> 12<span className="text-white/60 font-normal mx-1">s</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter mb-12">
          {FLASH_SALE_PRODUCTS.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="text-center">
          <Button variant="outline">View All Flash Deals</Button>
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
