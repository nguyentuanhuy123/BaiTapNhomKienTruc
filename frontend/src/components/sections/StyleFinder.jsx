import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const StyleFinder = () => {
  const categories = [
    {
      id: 'road-running',
      title: 'Road Running',
      vietnamese: 'Chạy Bộ Đường Phố',
      tagline: 'High cushioning & extreme energy return.',
      image: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&q=80&w=800',
      size: 'md:col-span-8',
      link: '/explore?category=Road'
    },
    {
      id: 'trail-outdoor',
      title: 'Trail & Outdoor',
      vietnamese: 'Chạy Bộ Địa Hình',
      tagline: 'Heavy-duty traction for off-road trails.',
      image: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&q=80&w=800',
      size: 'md:col-span-4',
      link: '/explore?category=Trail'
    },
    {
      id: 'gym-training',
      title: 'Gym & Training',
      vietnamese: 'Tập Luyện Đa Năng',
      tagline: 'Flat soles & absolute lateral stability.',
      image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=800',
      size: 'md:col-span-4',
      link: '/explore?category=Training'
    },
    {
      id: 'lifestyle',
      title: 'Street Lifestyle',
      vietnamese: 'Thời Trang Dạo Phố',
      tagline: 'Ultra-lightweight silhouettes for daily comfort.',
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800',
      size: 'md:col-span-8',
      link: '/explore?category=Lifestyle'
    }
  ];

  return (
    <section className="py-24 px-margin-mobile md:px-margin-desktop bg-zinc-50/50 w-full border-y border-zinc-100/50">
      <div className="max-w-container-max mx-auto space-y-16">
        
        {/* Header */}
        <div className="text-center space-y-4 max-w-xl mx-auto">
          <span className="bg-primary-container/10 text-primary-container text-[10px] px-5 py-2 rounded-full font-black uppercase tracking-[0.2em] inline-block border border-primary-container/10">
            Style Finder
          </span>
          <h2 className="text-4xl md:text-5xl font-space-grotesk font-black text-zinc-900 leading-none uppercase italic tracking-tight">
            Find Your Perfect Fit
          </h2>
          <p className="text-zinc-500 text-sm leading-relaxed">
            Engineered for every pace. Discover footwear tailored precisely to your movement, surface, and style.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {categories.map((cat, idx) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className={`${cat.size} group relative h-[380px] rounded-[40px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-white`}
            >
              {/* Background Image */}
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 ease-out group-hover:scale-105"
                style={{ backgroundImage: `url(${cat.image})` }}
              />
              
              {/* Dark Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent transition-opacity duration-500 group-hover:from-black/90" />

              {/* Card Contents */}
              <div className="absolute inset-0 p-8 flex flex-col justify-end items-start text-white space-y-3 z-10">
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white/55">
                  {cat.title}
                </span>
                
                <div>
                  <h3 className="font-space-grotesk font-black text-3xl md:text-4xl italic uppercase leading-none mb-1">
                    {cat.vietnamese}
                  </h3>
                  <p className="text-white/80 text-xs font-medium leading-relaxed max-w-sm">
                    {cat.tagline}
                  </p>
                </div>

                {/* Explore button inside Glassmorphism container */}
                <Link
                  to={cat.link}
                  className="mt-2 bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white hover:text-zinc-900 transition-all duration-300 px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-2"
                >
                  Khám phá ngay
                  <span className="material-symbols-outlined text-xs">arrow_forward</span>
                </Link>
              </div>

              {/* Soft lighting effect */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-[60px] pointer-events-none group-hover:bg-white/10 transition-all duration-500" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StyleFinder;
