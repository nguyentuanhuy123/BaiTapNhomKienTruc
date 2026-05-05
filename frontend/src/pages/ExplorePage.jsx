import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { EXPLORE_PRODUCTS, FILTER_OPTIONS } from '../constants/mockData';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import ProductCard from '../components/common/ProductCard';

const ExplorePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Running');
  const [selectedBrand, setSelectedBrand] = useState('Velocity');
  const [selectedColor, setSelectedColor] = useState('#0052FF');

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-12 px-margin-mobile md:px-margin-desktop max-w-[1440px] mx-auto w-full">
        {/* Header Section */}
        <div className="mb-12">
          <h1 className="text-headline-lg font-space-grotesk font-black text-zinc-900 mb-2">Explore All Velocity</h1>
          <p className="text-zinc-500 max-w-2xl">
            Push the boundaries of performance with our latest 3D-engineered footwear collection. 
            Designed for those who demand precision and speed.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar Filter */}
          <aside className="lg:w-64 shrink-0 space-y-10">
            {/* Category Filter */}
            <div>
              <h3 className="text-label-md font-bold text-zinc-400 uppercase tracking-widest mb-6">Category</h3>
              <div className="space-y-4">
                {FILTER_OPTIONS.categories.map((cat) => (
                  <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={selectedCategory === cat}
                      onChange={() => setSelectedCategory(cat)}
                      className="w-5 h-5 rounded-full border-2 border-zinc-200 checked:bg-primary-container checked:border-primary-container transition-all"
                    />
                    <span className={`text-body-md ${selectedCategory === cat ? 'text-zinc-900 font-bold' : 'text-zinc-500 group-hover:text-zinc-900'}`}>
                      {cat}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Brand Filter */}
            <div>
              <h3 className="text-label-md font-bold text-zinc-400 uppercase tracking-widest mb-6">Brand</h3>
              <div className="space-y-4">
                {FILTER_OPTIONS.brands.map((brand) => (
                  <label key={brand} className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={selectedBrand === brand}
                      onChange={() => setSelectedBrand(brand)}
                      className="w-5 h-5 rounded-full border-2 border-zinc-200 checked:bg-primary-container checked:border-primary-container transition-all"
                    />
                    <span className={`text-body-md ${selectedBrand === brand ? 'text-zinc-900 font-bold' : 'text-zinc-500 group-hover:text-zinc-900'}`}>
                      {brand}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Color Filter */}
            <div>
              <h3 className="text-label-md font-bold text-zinc-400 uppercase tracking-widest mb-6">Color</h3>
              <div className="flex flex-wrap gap-3">
                {FILTER_OPTIONS.colors.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setSelectedColor(color.value)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${selectedColor === color.value ? 'border-primary-container scale-110 shadow-lg' : 'border-zinc-100 hover:scale-110'}`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Search and Top Bar */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
              <div className="relative w-full md:max-w-md">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">search</span>
                <input 
                  type="text"
                  placeholder="Search technology..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-zinc-100 border-none rounded-full py-3.5 pl-12 pr-6 text-zinc-900 placeholder:text-zinc-400 focus:ring-2 focus:ring-primary-container outline-none transition-all"
                />
              </div>
              <div className="flex items-center gap-4 text-zinc-400">
                <button className="material-symbols-outlined hover:text-zinc-900">grid_view</button>
                <button className="material-symbols-outlined hover:text-zinc-900">view_list</button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {EXPLORE_PRODUCTS.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-16 flex justify-center items-center gap-3">
              <button className="w-10 h-10 flex items-center justify-center rounded-full border border-zinc-200 hover:bg-zinc-50 transition-all text-zinc-400">
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button className="w-10 h-10 flex items-center justify-center rounded-full bg-primary-container text-white font-bold">1</button>
              <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-zinc-100 text-zinc-500 transition-all">2</button>
              <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-zinc-100 text-zinc-500 transition-all">3</button>
              <span className="text-zinc-300">...</span>
              <button className="w-10 h-10 flex items-center justify-center rounded-full border border-zinc-200 hover:bg-zinc-50 transition-all text-zinc-400">
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ExplorePage;
