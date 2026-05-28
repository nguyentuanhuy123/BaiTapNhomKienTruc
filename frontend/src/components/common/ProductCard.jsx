import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { productService } from '../../services/productService';

const ProductCard = ({ 
  product, 
  className = "", 
  layout = "grid", 
  isLiked = false, 
  onToggleWishlist,
  isFlashSale = false 
}) => {
  // Check if this product is active in an ongoing Flash Sale campaign
  const storedActiveProds = JSON.parse(localStorage.getItem('active_flash_sale_products') || '[]');
  const matchedFlashSale = storedActiveProds.find(p => p.productId === product.id || p.productId === product.skuCode);

  const mainImage = product.imageResponses?.[0]?.url || product.image || '';
  
  // Custom tag & pricing based on active Flash Sale status (Option A)
  const displayTag = matchedFlashSale 
    ? '⚡ FLASH SALE' 
    : (product.isNew ? 'NEW' : (product.discountPercentage ? `-${product.discountPercentage}%` : product.tag));
  
  const displayPrice = matchedFlashSale 
    ? matchedFlashSale.salePrice 
    : (product.price || 0);
  
  const displayOldPrice = matchedFlashSale 
    ? (product.price || product.originalPrice) 
    : (product.oldPrice || product.originalPrice);

  const handleWishlistClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const username = localStorage.getItem('userEmail');
    if (!username) {
      alert('Vui lòng đăng nhập để lưu sản phẩm vào danh sách yêu thích!');
      window.location.href = '/login';
      return;
    }

    try {
      await productService.toggleWishlist(username, product.id);
      if (onToggleWishlist) {
        onToggleWishlist(product.id);
      } else {
        alert('❤️ Đã cập nhật danh sách yêu thích thành công!');
      }
    } catch (err) {
      console.error('Error toggling wishlist:', err);
    }
  };

  const CardWrapper = ({ children, to }) => {
    if (isFlashSale) {
      return (
        <motion.div
          whileHover={{ y: -8 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="h-full"
        >
          <div 
            className={`bg-white rounded-[32px] p-5 shadow-[0_10px_40px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)] group border border-zinc-50 transition-all block h-full ${className}`}
          >
            {children}
          </div>
        </motion.div>
      );
    }

    if (matchedFlashSale) {
      // Option A: Redirect to secure /flashsale page to prevent DB crash and use Kafka queues
      return (
        <motion.div
          whileHover={{ y: -8 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="h-full"
        >
          <Link 
            to="/flashsale"
            onClick={() => alert(`⚡ Sản phẩm "${product.name}" đang trong sự kiện mở bán Flash Sale! Để bảo vệ hệ thống và nhận giá ưu đãi cực sốc ${Number(displayPrice).toLocaleString('vi-VN')}đ, bạn sẽ được tự động chuyển hướng sang khu vực giật deal.`)}
            className={`bg-white rounded-[32px] p-5 shadow-[0_10px_40px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)] group cursor-pointer border border-zinc-50 transition-all block h-full ring-2 ring-red-500/20 ${className}`}
          >
            {children}
          </Link>
        </motion.div>
      );
    }

    return (
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
  };

  if (layout === "list") {
    return (
      <motion.div whileHover={{ x: 10 }} transition={{ duration: 0.3 }}>
        <div 
          className={`bg-white rounded-[24px] p-4 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] group border border-zinc-50 transition-all flex gap-8 ${className}`}
        >
          <div className="relative w-48 h-48 shrink-0 rounded-[20px] bg-zinc-50 flex items-center justify-center overflow-hidden">
            {displayTag && (
              <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-[9px] font-black uppercase z-10 ${matchedFlashSale ? 'bg-red-600 text-white animate-pulse' : 'bg-zinc-900 text-white'}`}>
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
                    {Number(displayOldPrice).toLocaleString('vi-VN')}đ
                  </span>
                )}
                <span className={`font-space-grotesk font-black text-3xl italic ${displayOldPrice ? 'text-red-600' : 'text-zinc-900'}`}>
                  {Number(displayPrice).toLocaleString('vi-VN')}đ
                </span>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={handleWishlistClick}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isLiked ? 'bg-red-50 text-red-500 shadow-inner' : 'bg-zinc-50 text-zinc-300 hover:text-red-500'}`}
                >
                  <span className={`material-symbols-outlined ${isLiked ? 'fill-red-500' : ''}`}>favorite</span>
                </button>
                {matchedFlashSale ? (
                  <Link to="/flashsale" className="bg-red-600 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] transition-all shadow-xl shadow-red-900/10 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">bolt</span> GIẬT DEAL
                  </Link>
                ) : (
                  <Link to={`/product/${product.id}`} className="bg-zinc-900 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-zinc-900/10">
                    Chi Tiết
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <CardWrapper to={`/product/${product.id}`}>
      <div className="relative w-full aspect-[4/5] rounded-[24px] bg-zinc-50 mb-6 flex items-center justify-center overflow-hidden">
        {displayTag && (
          <span className={`absolute top-4 left-4 px-3 py-1 rounded-full text-[9px] font-black uppercase z-10 ${matchedFlashSale ? 'bg-red-600 text-white animate-pulse' : 'bg-zinc-900 text-white'}`}>
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
                {Number(displayOldPrice).toLocaleString('vi-VN')}đ
              </span>
            )}
            <span className={`font-space-grotesk font-black text-xl italic ${matchedFlashSale ? 'text-red-600' : 'text-zinc-900'}`}>
              {Number(displayPrice).toLocaleString('vi-VN')}đ
            </span>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={handleWishlistClick}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isLiked ? 'bg-red-50 text-red-500' : 'text-zinc-200 hover:text-red-500 hover:bg-red-50/50'}`}
            >
              <span className={`material-symbols-outlined text-xl ${isLiked ? 'fill-red-500' : ''}`}>favorite</span>
            </button>
            {matchedFlashSale && !isFlashSale && (
              <Link 
                to="/flashsale"
                className="bg-red-600 text-white px-3 py-1.5 rounded-xl font-black text-[9px] uppercase tracking-wider hover:scale-[1.05] transition-all flex items-center gap-1 shadow-lg shadow-red-600/20"
              >
                <span className="material-symbols-outlined text-xs">bolt</span> DEAL
              </Link>
            )}
          </div>
        </div>
      </div>
    </CardWrapper>
  );
};

export default ProductCard;
