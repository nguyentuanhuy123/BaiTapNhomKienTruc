import React from 'react';
import { NEW_ARRIVALS } from '../../constants/mockData';

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
            <div key={product.id} className="min-w-[320px] md:min-w-[420px] bg-background rounded-lg p-6 snap-start ambient-shadow ambient-shadow-hover group">
              <div className="relative w-full aspect-square rounded-lg bg-white mb-6 flex items-center justify-center overflow-hidden">
                {product.tag && (
                  <span className="absolute top-4 left-4 bg-primary-container text-white px-3 py-1 rounded-full text-label-sm font-bold uppercase z-10">
                    {product.tag}
                  </span>
                )}
                <img 
                  alt={product.name} 
                  className="w-4/5 object-contain group-hover:scale-105 transition-transform duration-500" 
                  src={product.image} 
                />
              </div>
              <h3 className="font-headline-md text-zinc-900 mb-1">{product.name}</h3>
              <p className="text-secondary mb-4">{product.variant}</p>
              <div className="flex justify-between items-center">
                <span className="font-bold text-headline-md">${product.price.toFixed(2)}</span>
                <button className="material-symbols-outlined bg-zinc-900 text-white w-12 h-12 rounded-full flex items-center justify-center hover:bg-primary-container transition-all">
                  add
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewArrivals;
