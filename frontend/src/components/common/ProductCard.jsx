import React from 'react';
import { Link } from 'react-router-dom';

const ProductCard = ({ product, className = "" }) => {
  return (
    <Link 
      to={`/product/${product.id}`} 
      className={`bg-white rounded-2xl p-6 ambient-shadow ambient-shadow-hover group cursor-pointer border border-transparent hover:border-zinc-100 transition-all block ${className}`}
    >
      <div className="relative w-full aspect-square rounded-xl bg-zinc-50 mb-6 flex items-center justify-center overflow-hidden">
        {product.tag && (
          <span className="absolute top-4 left-4 bg-zinc-900 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase z-10 shadow-sm">
            {product.tag}
          </span>
        )}
        
        <img 
          alt={product.name} 
          className="w-4/5 object-contain group-hover:scale-110 transition-transform duration-500" 
          src={product.image} 
        />
        
        {/* Floating Cart Button */}
        <button className="absolute bottom-4 right-4 bg-primary-container text-white w-10 h-10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform translate-y-4 group-hover:translate-y-0 shadow-lg hover:bg-blue-700">
          <span className="material-symbols-outlined text-sm">shopping_cart</span>
        </button>
      </div>

      <div className="space-y-1">
        <h3 className="font-bold text-headline-md text-zinc-900 uppercase text-sm tracking-tight leading-tight line-clamp-1">
          {product.name}
        </h3>
        <p className="text-zinc-400 text-[11px] font-bold uppercase tracking-widest">
          {product.variant || product.category || 'Performance'}
        </p>
      </div>

      <div className="flex justify-between items-center mt-4">
        <span className="font-black text-headline-md text-zinc-900 italic">
          ${product.price.toFixed(2)}
        </span>
        <button className="material-symbols-outlined text-zinc-300 w-8 h-8 rounded-full flex items-center justify-center hover:bg-zinc-50 hover:text-red-500 transition-all text-xl">
          favorite
        </button>
      </div>
    </Link>
  );
};

export default ProductCard;
