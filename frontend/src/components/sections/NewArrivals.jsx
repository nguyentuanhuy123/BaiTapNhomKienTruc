import React from 'react';
import { NEW_ARRIVALS } from '../../constants/mockData';
import ProductCard from '../common/ProductCard';

const NewArrivals = () => {
  return (
    <section className="py-section-gap px-margin-mobile md:px-margin-desktop bg-white">
      <div className="max-w-container-max mx-auto">
        <div className="flex justify-between items-end mb-16">
          <div>
            <h2 className="font-space-grotesk font-black text-headline-xl text-zinc-900 leading-none mb-2 uppercase">New Arrivals</h2>
            <p className="text-body-lg text-secondary">The latest evolution in motion architecture.</p>
          </div>
          <div className="flex gap-4">
            <button className="material-symbols-outlined w-12 h-12 flex items-center justify-center rounded-full border border-zinc-200 hover:bg-zinc-50 transition-colors">arrow_back</button>
            <button className="material-symbols-outlined w-12 h-12 flex items-center justify-center rounded-full border border-zinc-200 hover:bg-zinc-50 transition-colors">arrow_forward</button>
          </div>
        </div>

        <div className="flex gap-gutter overflow-x-auto pb-12 snap-x scrollbar-hide">
          {NEW_ARRIVALS.map((product) => (
            <ProductCard key={product.id} product={product} className="min-w-[320px] md:min-w-[420px] snap-start" />
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewArrivals;
