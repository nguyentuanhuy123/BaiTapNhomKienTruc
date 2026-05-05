import React from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import ProductCard from '../components/common/ProductCard';
import { FLASH_SALE_PRODUCTS } from '../constants/mockData';

const FlashSalePage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />

      <main className="flex-1 pt-24 pb-20 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto w-full">
        {/* Header Section */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 bg-zinc-900 text-white px-5 py-2.5 rounded-full mb-8 shadow-xl">
            <span className="material-symbols-outlined text-sm text-yellow-400 animate-pulse">bolt</span>
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Live Flash Sale</span>
          </div>
          <h1 className="text-[56px] md:text-[72px] font-space-grotesk font-black text-zinc-900 mb-6 uppercase italic tracking-tighter leading-none">
            Limited <span className="text-primary-container">Time</span> Offers
          </h1>
          <p className="text-zinc-500 max-w-xl mx-auto text-body-lg">
            High-performance gear at unprecedented prices. These deals expire as soon as the clock hits zero. 
            <span className="text-zinc-900 font-bold"> Act fast, move faster.</span>
          </p>
        </div>

        {/* Countdown Timer */}
        <div className="flex justify-center gap-6 mb-20">
          {[
            { label: 'Hours', value: '02' },
            { label: 'Minutes', value: '45' },
            { label: 'Seconds', value: '18' }
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="bg-white w-24 h-24 rounded-[32px] border border-zinc-100 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.1)] flex items-center justify-center mb-4">
                <span className="text-4xl font-black font-space-grotesk text-zinc-900 italic">{item.value}</span>
              </div>
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.2em]">{item.label}</span>
            </div>
          ))}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {FLASH_SALE_PRODUCTS.map((product) => (
            <ProductCard 
              key={product.id} 
              product={{
                ...product,
                tag: product.discount // Ensure the discount tag is shown
              }} 
            />
          ))}
          {/* Duplicate some products to fill the grid for visual demo */}
          {FLASH_SALE_PRODUCTS.map((product) => (
            <ProductCard 
              key={`${product.id}-copy`} 
              product={{
                ...product,
                tag: product.discount
              }} 
            />
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FlashSalePage;
