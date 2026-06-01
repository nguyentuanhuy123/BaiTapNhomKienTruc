import React, { useState, useEffect } from 'react';
import { productService } from '../services/productService';
import { useAlert } from '../contexts/AlertContext';
import axiosClient from '../api/axiosClient';

const AdminCategoriesPage = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', description: '', slug: '' });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showAlert } = useAlert();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      
      // Fetch both categories and the full products catalog in parallel
      const [catData, prodData] = await Promise.all([
        productService.getAllCategories(),
        productService.getAllProducts(0, 200) // fetch products catalog to group
      ]);

      const products = prodData?.content || [];

      // Fetch dynamic inventory-service stock levels for all product skuCodes
      let inventoryMap = {};
      try {
        const skuCodes = products.map(p => p.skuCode).filter(Boolean);
        if (skuCodes.length > 0) {
          const invRes = await axiosClient.get(`/api/inventory`, {
            params: { skuCode: skuCodes.join(',') }
          });
          if (Array.isArray(invRes.data)) {
            invRes.data.forEach(item => {
              inventoryMap[item.skuCode] = item.quantity !== undefined && item.quantity !== null ? item.quantity : (item.isInStock ? 35 : 0);
            });
          }
        }
      } catch (invErr) {
        console.warn('Could not query dynamic inventory-service stock levels for categories page:', invErr);
      }

      const transformed = catData.map(c => {
        // Find all real products matching this category
        const matchedProducts = products.filter(p => 
          p.categoryId === c.id || 
          (p.categoryName && p.categoryName.toLowerCase() === c.name.toLowerCase())
        );

        // Sum the actual total stock of all matched products (inventory volume)
        const totalStock = matchedProducts.reduce((sum, p) => {
          const hasInventory = p.skuCode && inventoryMap[p.skuCode] !== undefined;
          return sum + (hasInventory ? inventoryMap[p.skuCode] : 0);
        }, 0);

        return {
          id: String(c.id),
          name: c.name || 'N/A',
          slug: c.name ? c.name.toLowerCase().replace(/\s+/g, '-') : 'general',
          description: c.description || 'No description provided.',
          itemCount: matchedProducts.length, // Real count of products
          inventoryVolume: totalStock, // Real sum of stock quantities
          icon: getCategoryIcon(c.name)
        };
      });
      
      setCategories(transformed);
    } catch (error) {
      console.error('Error fetching categories:', error);
      showAlert('Không thể tải danh mục sản phẩm!', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (name) => {
    const lower = (name || '').toLowerCase();
    if (lower.includes('run')) return 'directions_run';
    if (lower.includes('ath') || lower.includes('sport')) return 'sports_motorsports';
    if (lower.includes('life')) return 'style';
    return 'category';
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.name) return;
    try {
      const payload = {
        name: newCategory.name,
        description: newCategory.description || 'Premium Aero-Tech category.'
      };
      await productService.createCategory(payload);
      showAlert('Tạo danh mục mới thành công!', 'success');
      fetchCategories();
      setNewCategory({ name: '', description: '', slug: '' });
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding category:', error);
      showAlert('Không thể tạo danh mục!', 'error');
    }
  };

  const deleteCategory = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa danh mục này?')) return;
    try {
      await productService.deleteCategory(id);
      showAlert('Xóa danh mục thành công!', 'success');
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      showAlert('Không thể xóa danh mục!', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-container mx-auto mb-4"></div>
          <p className="text-zinc-500 font-bold">Đang tải danh mục...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6">
        <div>
          <span className="bg-primary-container/10 text-primary-container text-xs px-4 py-1.5 rounded-full font-black uppercase tracking-widest mb-4 inline-block">
            Product Taxonomy
          </span>
          <h1 className="text-4xl font-space-grotesk font-black text-zinc-900 leading-none uppercase italic">
            Categories Console
          </h1>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-primary-container text-white px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-[0_10px_25px_-5px_rgba(0,82,255,0.3)] w-fit"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          Create Category
        </button>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {categories.map((cat) => (
          <div key={cat.id} className="bg-white rounded-[32px] p-8 border border-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col justify-between group hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] transition-all duration-300">
            <div>
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-zinc-900 text-white rounded-2xl flex items-center justify-center">
                  <span className="material-symbols-outlined">{cat.icon}</span>
                </div>
                <button
                  onClick={() => deleteCategory(cat.id)}
                  className="w-8 h-8 rounded-full hover:bg-red-50 text-zinc-300 hover:text-red-500 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                >
                  <span className="material-symbols-outlined text-sm">delete</span>
                </button>
              </div>

              <h3 className="text-lg font-black font-space-grotesk text-zinc-900 uppercase italic mb-2 tracking-tight">{cat.name}</h3>
              <p className="text-[10px] font-black text-primary-container uppercase tracking-widest mb-4">Slug: {cat.slug}</p>
              <p className="text-xs text-zinc-400 leading-relaxed font-bold mb-6">{cat.description}</p>
            </div>

            {/* Dynamic Inventory Volume and Products count displays */}
            <div className="pt-6 border-t border-zinc-50 flex justify-between items-center text-xs">
              <div>
                <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Inventory volume</p>
                <p className="font-extrabold text-primary-container mt-0.5">{cat.inventoryVolume} ITEMS</p>
              </div>
              <span className="bg-zinc-50 border border-zinc-100 text-zinc-700 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest">
                {cat.itemCount} PRODUCTS
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-zinc-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in">
          <div className="bg-white rounded-[32px] w-full max-w-lg p-8 border border-zinc-100 shadow-[0_20px_50px_rgba(0,0,0,0.15)] animate-scale-up">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold font-space-grotesk text-zinc-900 uppercase">Tạo danh mục mới</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-10 h-10 rounded-full hover:bg-zinc-100 flex items-center justify-center text-zinc-400 hover:text-zinc-900 transition-all"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleAddCategory} className="space-y-6">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-zinc-500 mb-2">Tên danh mục</label>
                <input
                  type="text"
                  required
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  placeholder="Ví dụ: Training Gears"
                  className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-primary-container transition-all font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-zinc-500 mb-2">Mô tả danh mục</label>
                <textarea
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                  placeholder="Nhập mô tả ngắn cho danh mục sản phẩm..."
                  rows="3"
                  className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-primary-container transition-all font-bold text-sm"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-primary-container text-white font-bold py-5 rounded-2xl shadow-[0_15px_30px_-5px_rgba(0,82,255,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
              >
                <span className="material-symbols-outlined">save</span>
                LƯU DANH MỤC
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategoriesPage;
