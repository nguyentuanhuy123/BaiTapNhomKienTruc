import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FILTER_OPTIONS } from '../constants/mockData';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import ProductCard from '../components/common/ProductCard';
import { productService } from '../services/productService';

const ExplorePage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [selectedPriceRange, setSelectedPriceRange] = useState('All');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  // Reset page to 0 when filters change
  useEffect(() => {
    setCurrentPage(0);
  }, [selectedCategory, selectedBrand, selectedPriceRange, searchQuery]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const PAGE_SIZE = 6;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productsData, categoriesData] = await Promise.all([
          productService.getAllProducts(currentPage, PAGE_SIZE, selectedCategory, selectedBrand, 'All'),
          productService.getAllCategories()
        ]);
        setProducts(productsData.content || []);
        setTotalPages(productsData.totalPages || 0);
        setTotalElements(productsData.totalElements || 0);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Failed to fetch explore data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPage, selectedCategory, selectedBrand]);

  // Smooth scroll to top when current page or any filters are updated
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage, selectedCategory, selectedBrand, selectedPriceRange]);

  // Client side search and price range filtering
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesPrice = true;
    if (selectedPriceRange === 'under-50') {
      matchesPrice = product.price < 50;
    } else if (selectedPriceRange === '50-100') {
      matchesPrice = product.price >= 50 && product.price <= 100;
    } else if (selectedPriceRange === 'above-100') {
      matchesPrice = product.price > 100;
    }

    return matchesSearch && matchesPrice;
  });

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
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={selectedCategory === 'All'}
                    onChange={() => setSelectedCategory('All')}
                    className="w-5 h-5 rounded-full border-2 border-zinc-200 checked:bg-primary-container checked:border-primary-container transition-all"
                  />
                  <span className={`text-body-md ${selectedCategory === 'All' ? 'text-zinc-900 font-bold' : 'text-zinc-500 group-hover:text-zinc-900'}`}>
                    All Categories
                  </span>
                </label>
                {categories.map((cat) => (
                  <label key={cat.id} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={selectedCategory === cat.name}
                      onChange={() => setSelectedCategory(selectedCategory === cat.name ? 'All' : cat.name)}
                      className="w-5 h-5 rounded-full border-2 border-zinc-200 checked:bg-primary-container checked:border-primary-container transition-all"
                    />
                    <span className={`text-body-md ${selectedCategory === cat.name ? 'text-zinc-900 font-bold' : 'text-zinc-500 group-hover:text-zinc-900'}`}>
                      {cat.name}
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
                      onChange={() => setSelectedBrand(selectedBrand === brand ? 'All' : brand)}
                      className="w-5 h-5 rounded-full border-2 border-zinc-200 checked:bg-primary-container checked:border-primary-container transition-all"
                    />
                    <span className={`text-body-md ${selectedBrand === brand ? 'text-zinc-900 font-bold' : 'text-zinc-500 group-hover:text-zinc-900'}`}>
                      {brand}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range Filter */}
            <div>
              <h3 className="text-label-md font-bold text-zinc-400 uppercase tracking-widest mb-6">Price Range</h3>
              <div className="space-y-4">
                {[
                  { value: 'All', label: 'All Prices' },
                  { value: 'under-50', label: 'Under $50' },
                  { value: '50-100', label: '$50 - $100' },
                  { value: 'above-100', label: 'Over $100' }
                ].map((range) => (
                  <label key={range.value} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="radio"
                      name="priceRange"
                      checked={selectedPriceRange === range.value}
                      onChange={() => setSelectedPriceRange(range.value)}
                      className="w-5 h-5 border-2 border-zinc-200 text-primary-container focus:ring-primary-container focus:ring-offset-0 focus:ring-0 checked:bg-primary-container checked:border-primary-container transition-all cursor-pointer"
                    />
                    <span className={`text-body-md ${selectedPriceRange === range.value ? 'text-zinc-900 font-bold' : 'text-zinc-500 group-hover:text-zinc-900'}`}>
                      {range.label}
                    </span>
                  </label>
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
                <button
                  onClick={() => setViewMode('grid')}
                  className={`material-symbols-outlined transition-colors ${viewMode === 'grid' ? 'text-zinc-900 bg-zinc-100 p-2 rounded-lg' : 'hover:text-zinc-900 p-2'}`}
                >
                  grid_view
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`material-symbols-outlined transition-colors ${viewMode === 'list' ? 'text-zinc-900 bg-zinc-100 p-2 rounded-lg' : 'hover:text-zinc-900 p-2'}`}
                >
                  view_list
                </button>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-[400px] bg-zinc-100 animate-pulse rounded-2xl" />
                ))}
              </div>
            ) : (
              <>
                <div className={viewMode === 'grid'
                  ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
                  : "flex flex-col gap-6"
                }>
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      layout={viewMode}
                    />
                  ))}
                </div>

                {filteredProducts.length === 0 && (
                  <div className="text-center py-20">
                    <p className="text-zinc-500 font-space-grotesk uppercase tracking-widest">No products found matching your criteria</p>
                  </div>
                )}
              </>
            )}

            {/* Pagination */}
            {totalPages > 0 && (
              <div className="mt-16 flex justify-center items-center gap-3">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                  disabled={currentPage === 0}
                  className={`w-10 h-10 flex items-center justify-center rounded-full border border-zinc-200 transition-all ${currentPage === 0 ? 'text-zinc-200 cursor-not-allowed' : 'text-zinc-400 hover:bg-zinc-50'}`}
                >
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>

                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentPage(index)}
                    className={`w-10 h-10 flex items-center justify-center rounded-full font-bold transition-all ${currentPage === index ? 'bg-primary-container text-white' : 'hover:bg-zinc-100 text-zinc-500'}`}
                  >
                    {index + 1}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                  disabled={currentPage === totalPages - 1}
                  className={`w-10 h-10 flex items-center justify-center rounded-full border border-zinc-200 transition-all ${currentPage === totalPages - 1 ? 'text-zinc-200 cursor-not-allowed' : 'text-zinc-400 hover:bg-zinc-50'}`}
                >
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ExplorePage;
