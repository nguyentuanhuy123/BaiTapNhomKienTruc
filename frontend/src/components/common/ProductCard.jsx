import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const ProductCard = ({ product, className = "", layout = "grid", isLiked = false, onToggleWishlist }) => {
  const mainImage = product.imageResponses?.[0]?.url || product.image || '';
  const displayTag = product.isNew ? 'NEW' : (product.discountPercentage ? `-${product.discountPercentage}%` : product.tag);
  const displayPrice = product.price || 0;
  const displayOldPrice = product.oldPrice || product.originalPrice;

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Temporarily disabled API call for auth implementation
    /*
    if (onToggleWishlist) {
      onToggleWishlist(product.id);
    }
    */
    // For now, we can just log or do nothing to prevent errors
    console.log("Wishlist toggled locally for product:", product.id);
  };

  const CardWrapper = ({ children, to }) => (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="h-full"
    >
      <Link 
        to={to} 
        className={`bg-white rounded-[32px] p-5 shadow-[0_10px_40px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)] group cursor-pointer border border-zinc-50 transition-all block h-full ${className}`}
      >
        {children}
      </Link>
    </motion.div>
  );

  if (layout === "list") {
    return (
      <motion.div whileHover={{ x: 10 }} transition={{ duration: 0.3 }}>
        <Link 
          to={`/product/${product.id}`} 
          className={`bg-white rounded-[24px] p-4 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] group cursor-pointer border border-zinc-50 transition-all flex gap-8 ${className}`}
        >
          <div className="relative w-48 h-48 shrink-0 rounded-[20px] bg-zinc-50 flex items-center justify-center overflow-hidden">
            {displayTag && (
              <span className="absolute top-3 left-3 bg-zinc-900 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase z-10">
                {displayTag}
              </span>
            )}
            <img 
              alt={product.name} 
              className="w-[85%] object-contain group-hover:scale-110 transition-transform duration-700 ease-out" 
              src={mainImage} 
            />
          </div>

          <div className="flex-1 flex flex-col justify-between py-3">
            <div>
              <p className="text-blue-600 text-[10px] font-black uppercase tracking-[0.2em] mb-2">
                {product.categoryName || product.category || 'Performance'}
              </p>
              <h3 className="font-space-grotesk font-black text-2xl text-zinc-900 uppercase italic leading-none mb-3">
                {product.name}
              </h3>
              <p className="text-zinc-400 text-sm line-clamp-2 leading-relaxed max-w-md">
                {product.description || "Highest performance silhouettes engineered for speed and precision."}
              </p>
            </div>

            <div className="flex justify-between items-end">
              <div className="flex flex-col">
                {displayOldPrice && (
                  <span className="text-zinc-300 line-through text-xs font-bold mb-1">
                    ${Number(displayOldPrice).toFixed(2)}
                  </span>
                )}
                <span className={`font-space-grotesk font-black text-3xl italic ${displayOldPrice ? 'text-blue-600' : 'text-zinc-900'}`}>
                  ${Number(displayPrice).toFixed(2)}
                </span>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={handleWishlistClick}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isLiked ? 'bg-red-50 text-red-500 shadow-inner' : 'bg-zinc-50 text-zinc-300 hover:text-red-500'}`}
                >
                  <span className={`material-symbols-outlined ${isLiked ? 'fill-red-500' : ''}`}>favorite</span>
                </button>
                <button className="bg-zinc-900 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-zinc-900/10">
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        </Link>
      </motion.div>
    );
  }

  return (
    <CardWrapper to={`/product/${product.id}`}>
      <div className="relative w-full aspect-[4/5] rounded-[24px] bg-zinc-50 mb-6 flex items-center justify-center overflow-hidden">
        {displayTag && (
          <span className="absolute top-4 left-4 bg-zinc-900 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase z-10">
            {displayTag}
          </span>
        )}
        
        <img 
          alt={product.name} 
          className="w-[85%] object-contain group-hover:scale-110 group-hover:-rotate-3 transition-all duration-700 ease-out" 
          src={mainImage} 
        />
        
        {/* Quick View Overlay */}
        <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>

      <div className="px-1">
        <p className="text-blue-600 text-[9px] font-black uppercase tracking-[0.2em] mb-1">
          {product.categoryName || product.category || 'Performance'}
        </p>
        <h3 className="font-space-grotesk font-black text-zinc-900 uppercase italic text-lg leading-tight mb-4 group-hover:text-blue-600 transition-colors">
          {product.name}
        </h3>

        <div className="flex justify-between items-end border-t border-zinc-50 pt-4">
          <div className="flex flex-col">
            {displayOldPrice && (
              <span className="text-zinc-300 line-through text-[10px] font-bold">
                ${Number(displayOldPrice).toFixed(2)}
              </span>
            )}
            <span className={`font-space-grotesk font-black text-xl italic ${displayOldPrice ? 'text-blue-600' : 'text-zinc-900'}`}>
              ${Number(displayPrice).toFixed(2)}
            </span>
          </div>
          
          <button 
            onClick={handleWishlistClick}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isLiked ? 'bg-red-50 text-red-500' : 'text-zinc-200 hover:text-red-500 hover:bg-red-50/50'}`}
          >
            <span className={`material-symbols-outlined text-xl ${isLiked ? 'fill-red-500' : ''}`}>favorite</span>
          </button>
        </div>
      </div>
    </CardWrapper>
  );
};

export default ProductCard;
