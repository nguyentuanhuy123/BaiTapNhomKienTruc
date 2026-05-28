import React, { useState, useEffect } from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import ProductCard from '../components/common/ProductCard';
import { productService } from '../services/productService';
import { Link } from 'react-router-dom';

const WishlistPage = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  const username = localStorage.getItem('userEmail') || 'testuser';

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const data = await productService.getWishlist(username);
      setWishlist(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch wishlist:', error);
      setWishlist([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleToggleWishlist = async (productId) => {
    try {
      await productService.toggleWishlist(username, productId);
      // Update local state by removing the item
      setWishlist(wishlist.filter(item => item.id !== productId));
    } catch (error) {
      console.error('Failed to remove from wishlist:', error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />

      <main className="flex-1 pt-32 pb-20">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="mb-12">
            <h1 className="text-headline-xl font-space-grotesk font-black text-zinc-900 uppercase italic">Your Wishlist</h1>
            <p className="text-zinc-500 font-medium">Items you've saved for later.</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="aspect-[3/4] bg-zinc-50 animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : wishlist.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
              {wishlist.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  isLiked={true}
                  onToggleWishlist={handleToggleWishlist}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-32 bg-zinc-50 rounded-[40px]">
              <span className="material-symbols-outlined text-6xl text-zinc-200 mb-6">heart_broken</span>
              <h2 className="text-2xl font-bold text-zinc-900 mb-4">Your wishlist is empty</h2>
              <p className="text-zinc-500 mb-8 max-w-xs mx-auto">Explore our collection and save your favorite items here.</p>
              <Link 
                to="/explore" 
                className="inline-flex items-center gap-2 bg-primary-container text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:scale-105 transition-all"
              >
                Go to Explore
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default WishlistPage;
