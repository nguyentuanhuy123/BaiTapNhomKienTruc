import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productService } from '../services/productService';
import { useAlert } from '../contexts/AlertContext';
import axiosClient from '../api/axiosClient';

const AdminProductsPage = () => {
  const navigate = useNavigate();
  const { showAlert } = useAlert();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Products Data
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // View Details Modal State
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Edit Modal State
  const [editProduct, setEditProduct] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [categories, setCategories] = useState([]);
  const [editSubmitting, setEditSubmitting] = useState(false);

  useEffect(() => {
    fetchProductsData(currentPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  const fetchProductsData = async (page) => {
    try {
      setLoading(true);
      
      // 1. Fetch products & categories in parallel
      const [productsData, categoriesData] = await Promise.all([
        productService.getAllProducts(page, pageSize),
        productService.getAllCategories()
      ]);
      
      setCategories(categoriesData || []);
      const rawProducts = productsData.content || [];
      
      // Update pagination metadata
      setTotalPages(productsData.totalPages || 0);
      setTotalElements(productsData.totalElements || 0);

      // 2. Fetch inventory stock levels for all products in parallel
      let inventoryMap = {};
      try {
        const skuCodes = rawProducts.map(p => p.skuCode).filter(Boolean);
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
        console.warn('Could not query dynamic inventory-service stock levels:', invErr);
      }

      // 3. Transform and bind dynamic stock
      const transformedProducts = rawProducts.map(p => {
        const hasInventory = p.skuCode && inventoryMap[p.skuCode] !== undefined;
        return {
          id: String(p.id),
          name: p.name || 'N/A',
          description: p.description || '',
          skuCode: p.skuCode || '',
          price: p.price || 0,
          oldPrice: p.oldPrice || p.price || 0,
          discountPercentage: p.discountPercentage || 0,
          brand: p.brand || 'Aero-Tech',
          colors: Array.isArray(p.colors) ? p.colors.join(', ') : '',
          sizes: Array.isArray(p.sizes) ? p.sizes.join(', ') : '',
          categoryName: p.categoryName || 'General',
          stock: hasInventory ? inventoryMap[p.skuCode] : 0, 
          image: p.imageResponses?.[0]?.url || 'https://via.placeholder.com/150',
          imageResponses: p.imageResponses || []
        };
      });
      
      setProducts(transformedProducts);
    } catch (error) {
      console.error('Error fetching admin products data:', error);
      showAlert('Không thể tải danh sách dữ liệu!', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetail = (product) => {
    setSelectedProduct(product);
    setShowDetailModal(true);
  };

  const handleOpenEdit = (product) => {
    setEditProduct({
      ...product,
      categoryId: categories.find(c => c.name === product.categoryName)?.id || ''
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editProduct.name || !editProduct.price || !editProduct.categoryId) {
      showAlert('Vui lòng điền đầy đủ thông tin bắt buộc!', 'warning');
      return;
    }

    try {
      setEditSubmitting(true);
      const colorsList = editProduct.colors.split(',').map(c => c.trim()).filter(Boolean);
      const sizesList = editProduct.sizes.split(',').map(s => parseFloat(s.trim())).filter(n => !isNaN(n));

      const payload = {
        name: editProduct.name,
        description: editProduct.description,
        skuCode: editProduct.skuCode,
        price: parseFloat(editProduct.price),
        oldPrice: parseFloat(editProduct.oldPrice || editProduct.price),
        discountPercentage: parseInt(editProduct.discountPercentage) || 0,
        isNew: true,
        brand: editProduct.brand || 'Aero-Tech',
        colors: colorsList,
        sizes: sizesList,
        categoryId: parseInt(editProduct.categoryId),
        images: editProduct.imageResponses && editProduct.imageResponses.length > 0 ? editProduct.imageResponses.map(img => ({
          name: img.name || editProduct.name,
          url: img.url
        })) : [{ name: editProduct.name, url: editProduct.image }]
      };

      // 1. Update product in product-service
      await productService.updateProduct(editProduct.id, payload);

      // 2. Synchronize stock to inventory-service
      try {
        await axiosClient.post('/api/inventory', {
          skuCode: editProduct.skuCode,
          quantity: parseInt(editProduct.stock) || 0
        });
      } catch (invErr) {
        console.error('Failed to sync updated stock levels:', invErr);
      }

      showAlert('Cập nhật sản phẩm thành công!', 'success');
      setShowEditModal(false);
      fetchProductsData(currentPage);
    } catch (error) {
      console.error('Error editing product:', error);
      const serverMsg = error.response?.data?.message || error.message;
      showAlert(`Lỗi khi sửa sản phẩm: ${serverMsg}`, 'error');
    } finally {
      setEditSubmitting(false);
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return;
    try {
      await productService.deleteProduct(id);
      showAlert('Xóa sản phẩm thành công!', 'success');
      fetchProductsData(currentPage);
    } catch (error) {
      console.error('Error deleting product:', error);
      showAlert('Không thể xóa sản phẩm!', 'error');
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.categoryName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-container mx-auto mb-4"></div>
          <p className="text-zinc-500 font-bold">Đang tải danh sách sản phẩm...</p>
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
            Inventory Management
          </span>
          <h1 className="text-4xl font-space-grotesk font-black text-zinc-900 leading-none uppercase italic">
            Products List
          </h1>
        </div>

        <button
          onClick={() => navigate('/admin/products/add')}
          className="bg-primary-container text-white px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-[0_10px_25px_-5px_rgba(0,82,255,0.3)] w-fit"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          Add New Product
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white rounded-3xl p-6 border border-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.01)] flex gap-4 items-center">
        <span className="material-symbols-outlined text-zinc-400">search</span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Tìm sản phẩm bằng tên hoặc danh mục..."
          className="w-full text-sm text-zinc-800 outline-none bg-transparent"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-[32px] p-8 border border-zinc-100 shadow-[0_20px_50px_rgba(0,0,0,0.02)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-100">
                <th className="pb-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Sản phẩm</th>
                <th className="pb-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Danh mục</th>
                <th className="pb-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Giá bán</th>
                <th className="pb-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Tồn kho</th>
                <th className="pb-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="group hover:bg-zinc-50/50 transition-colors">
                  <td className="py-5 flex items-center gap-4">
                    <div className="w-14 h-14 bg-zinc-50 border border-zinc-100 rounded-xl p-2 shrink-0">
                      <img src={product.image} alt={product.name} className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <p className="font-bold text-zinc-900 leading-tight">{product.name}</p>
                      <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mt-1">SKU: {product.skuCode}</p>
                    </div>
                  </td>
                  <td className="py-5 text-sm font-bold text-zinc-600">{product.categoryName}</td>
                  <td className="py-5 font-black font-space-grotesk italic text-zinc-950">${product.price.toFixed(2)}</td>
                  <td className="py-5">
                    <span className={`px-3 py-1 rounded-md text-[10px] font-black tracking-widest ${
                      product.stock > 10 ? 'bg-zinc-100 text-zinc-700' : 'bg-red-50 text-red-600'
                    }`}>
                      {product.stock} ITEMS
                    </span>
                  </td>
                  <td className="py-5 text-right space-x-2">
                    <button
                      onClick={() => handleOpenDetail(product)}
                      className="p-3 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl transition-all"
                      title="Xem chi tiết"
                    >
                      <span className="material-symbols-outlined text-lg">visibility</span>
                    </button>
                    <button
                      onClick={() => handleOpenEdit(product)}
                      className="p-3 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-all"
                      title="Chỉnh sửa"
                    >
                      <span className="material-symbols-outlined text-lg">edit</span>
                    </button>
                    <button
                      onClick={() => deleteProduct(product.id)}
                      className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                      title="Xóa"
                    >
                      <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Dynamic Pagination Controls (10 items per page) */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-zinc-100">
          <span className="text-xs text-zinc-400 font-bold uppercase tracking-widest">
            Hiển thị {filteredProducts.length} của {totalElements} sản phẩm
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
              disabled={currentPage === 0}
              className="w-10 h-10 rounded-xl border border-zinc-100 bg-white hover:bg-zinc-50 disabled:opacity-40 transition-all flex items-center justify-center text-zinc-600"
            >
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            
            {Array.from({ length: totalPages || 1 }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentPage(idx)}
                className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${
                  currentPage === idx
                    ? 'bg-primary-container text-white shadow-lg'
                    : 'border border-zinc-100 bg-white hover:bg-zinc-50 text-zinc-700'
                }`}
              >
                {idx + 1}
              </button>
            ))}

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                disabled={currentPage === totalPages - 1 || totalPages <= 1}
                className="w-10 h-10 rounded-xl border border-zinc-100 bg-white hover:bg-zinc-50 disabled:opacity-40 transition-all flex items-center justify-center text-zinc-600"
              >
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            </div>
          </div>
      </div>

      {/* Modal A: View Details */}
      {showDetailModal && selectedProduct && (
        <div className="fixed inset-0 bg-zinc-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-[32px] w-full max-w-2xl p-8 border border-zinc-100 shadow-[0_20px_50px_rgba(0,0,0,0.15)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-primary-container to-blue-400"></div>
            
            <div className="flex justify-between items-center mb-6">
              <span className="bg-primary-container/10 text-primary-container text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                Product Metadata
              </span>
              <button
                onClick={() => setShowDetailModal(false)}
                className="w-10 h-10 rounded-full hover:bg-zinc-100 flex items-center justify-center text-zinc-400 hover:text-zinc-900 transition-all"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Product Visual */}
              <div className="space-y-4">
                <div className="bg-zinc-50 border border-zinc-100 rounded-3xl p-6 aspect-square flex items-center justify-center">
                  <img
                    src={selectedProduct.image}
                    alt={selectedProduct.name}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <div className="flex gap-2 overflow-x-auto py-1">
                  {selectedProduct.imageResponses?.map((img, idx) => (
                    <img
                      key={idx}
                      src={img.url}
                      alt="thumbnail"
                      className="w-12 h-12 object-contain border border-zinc-100 bg-zinc-50 rounded-xl p-1 shrink-0"
                    />
                  ))}
                </div>
              </div>

              {/* Product Data */}
              <div className="space-y-4 text-left">
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                  {selectedProduct.brand} &bull; {selectedProduct.categoryName}
                </span>
                <h2 className="text-2xl font-black text-zinc-900 leading-tight">{selectedProduct.name}</h2>
                <p className="text-3xl font-black font-space-grotesk italic text-zinc-900">${selectedProduct.price.toFixed(2)}</p>
                
                <div className="pt-3 border-t border-zinc-100 space-y-2">
                  <p className="text-xs text-zinc-500 font-bold leading-relaxed">{selectedProduct.description || 'Không có mô tả chi tiết.'}</p>
                  
                  <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
                    <div>
                      <span className="text-zinc-400 font-semibold block">Mã SKU:</span>
                      <strong className="text-zinc-800">{selectedProduct.skuCode}</strong>
                    </div>
                    <div>
                      <span className="text-zinc-400 font-semibold block">Số lượng tồn kho:</span>
                      <strong className="text-zinc-800">{selectedProduct.stock} sản phẩm</strong>
                    </div>
                    <div>
                      <span className="text-zinc-400 font-semibold block">Màu sắc:</span>
                      <strong className="text-zinc-800">{selectedProduct.colors || 'Mặc định'}</strong>
                    </div>
                    <div>
                      <span className="text-zinc-400 font-semibold block">Kích cỡ giày:</span>
                      <strong className="text-zinc-800">{selectedProduct.sizes || 'Tất cả'}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal B: Edit Product */}
      {showEditModal && editProduct && (
        <div className="fixed inset-0 bg-zinc-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-6 overflow-y-auto">
          <div className="bg-white rounded-[32px] w-full max-w-2xl p-8 my-8 border border-zinc-100 shadow-[0_20px_50px_rgba(0,0,0,0.15)] relative">
            <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-blue-400 to-indigo-500"></div>
            
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold font-space-grotesk text-zinc-900 uppercase">Chỉnh sửa sản phẩm</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="w-10 h-10 rounded-full hover:bg-zinc-100 flex items-center justify-center text-zinc-400 hover:text-zinc-900 transition-all"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-zinc-400 mb-1">Tên sản phẩm *</label>
                <input
                  type="text"
                  required
                  value={editProduct.name}
                  onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })}
                  className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-5 py-3 outline-none focus:ring-2 focus:ring-primary-container transition-all font-bold text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-zinc-400 mb-1">Thương hiệu</label>
                  <input
                    type="text"
                    value={editProduct.brand}
                    onChange={(e) => setEditProduct({ ...editProduct, brand: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-5 py-3 outline-none focus:ring-2 focus:ring-primary-container transition-all font-bold text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-zinc-400 mb-1">Mã SKU</label>
                  <input
                    type="text"
                    required
                    value={editProduct.skuCode}
                    onChange={(e) => setEditProduct({ ...editProduct, skuCode: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-5 py-3 outline-none focus:ring-2 focus:ring-primary-container transition-all font-bold text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-zinc-400 mb-1">Màu sắc (phẩy)</label>
                  <input
                    type="text"
                    value={editProduct.colors}
                    onChange={(e) => setEditProduct({ ...editProduct, colors: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-5 py-3 outline-none focus:ring-2 focus:ring-primary-container transition-all font-bold text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-zinc-400 mb-1">Sizes giày (phẩy)</label>
                  <input
                    type="text"
                    value={editProduct.sizes}
                    onChange={(e) => setEditProduct({ ...editProduct, sizes: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-5 py-3 outline-none focus:ring-2 focus:ring-primary-container transition-all font-bold text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-zinc-400 mb-1">Giá bán ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editProduct.price}
                    onChange={(e) => setEditProduct({ ...editProduct, price: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-5 py-3 outline-none focus:ring-2 focus:ring-primary-container transition-all font-bold text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-zinc-400 mb-1">Tồn kho cập nhật *</label>
                  <input
                    type="number"
                    required
                    value={editProduct.stock}
                    onChange={(e) => setEditProduct({ ...editProduct, stock: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-5 py-3 outline-none focus:ring-2 focus:ring-primary-container transition-all font-bold text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-zinc-400 mb-1">Danh mục *</label>
                  <select
                    required
                    value={editProduct.categoryId}
                    onChange={(e) => setEditProduct({ ...editProduct, categoryId: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-5 py-3 outline-none focus:ring-2 focus:ring-primary-container transition-all font-bold text-sm text-zinc-600 cursor-pointer"
                  >
                    <option value="">Chọn danh mục</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-zinc-400 mb-1">Mô tả sản phẩm</label>
                <textarea
                  value={editProduct.description}
                  onChange={(e) => setEditProduct({ ...editProduct, description: e.target.value })}
                  rows="3"
                  className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-5 py-3 outline-none focus:ring-2 focus:ring-primary-container transition-all font-bold text-sm resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-zinc-400 mb-1">Đường dẫn ảnh chính (URL)</label>
                <input
                  type="text"
                  value={editProduct.image}
                  onChange={(e) => setEditProduct({ 
                    ...editProduct, 
                    image: e.target.value,
                    imageResponses: [{ id: editProduct.imageResponses?.[0]?.id, url: e.target.value }]
                  })}
                  className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-5 py-3 outline-none focus:ring-2 focus:ring-primary-container transition-all font-bold text-xs"
                />
              </div>

              <div className="flex gap-4 pt-4 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 border border-zinc-200 text-zinc-700 font-bold py-3.5 rounded-xl hover:bg-zinc-50 transition-all text-xs"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={editSubmitting}
                  className="flex-1 bg-primary-container text-white font-bold py-3.5 rounded-xl hover:bg-zinc-900 transition-all text-xs flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {editSubmitting ? 'ĐANG LƯU...' : 'CẬP NHẬT'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProductsPage;
