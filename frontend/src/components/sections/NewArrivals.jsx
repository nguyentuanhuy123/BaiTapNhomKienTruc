import React, { useEffect, useState } from 'react';
import ProductCard from '../common/ProductCard';
import { productService } from '../../services/productService';

const NewArrivals = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = React.useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 450;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await productService.getAllProducts(0, 10);
        setProducts(data.content || []);
      } catch (error) {
        console.error('Failed to fetch new arrivals:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <section className="py-section-gap px-margin-mobile md:px-margin-desktop bg-white">
      <div className="max-w-container-max mx-auto">
        <div className="flex justify-between items-end mb-16">
          <div>
            <h2 className="font-space-grotesk font-black text-headline-xl text-zinc-900 leading-none mb-2 uppercase">New Arrivals</h2>
            <p className="text-body-lg text-secondary">The latest evolution in motion architecture.</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => scroll('left')}
              className="material-symbols-outlined w-12 h-12 flex items-center justify-center rounded-full border border-zinc-200 hover:bg-zinc-50 transition-colors"
            >
              arrow_back
            </button>
            <button
              onClick={() => scroll('right')}
              className="material-symbols-outlined w-12 h-12 flex items-center justify-center rounded-full border border-zinc-200 hover:bg-zinc-50 transition-colors"
            >
              arrow_forward
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex gap-gutter overflow-x-auto pb-12 scrollbar-hide">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="min-w-[320px] md:min-w-[420px] h-[400px] bg-zinc-50 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : (
          <div
            ref={scrollRef}
            className="flex gap-gutter overflow-x-auto pb-12 snap-x scrollbar-hide"
          >
            {products.map((product) => (
              <ProductCard key={product.id} product={product} className="min-w-[320px] md:min-w-[420px] snap-start" />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default NewArrivals;
