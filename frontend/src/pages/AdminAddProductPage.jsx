import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productService } from '../services/productService';
import { useAlert } from '../contexts/AlertContext';
import axiosClient from '../api/axiosClient';

const AdminAddProductPage = () => {
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // List of images. Each item: { isFile: boolean, data: string (URL or base64 data) }
  const [imageList, setImageList] = useState([]);

  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    categoryId: '',
    stock: '',
    skuCode: '',
    description: '',
    brand: 'Aero-Tech',
    colors: 'Multicolor, Black, White',
    sizes: '40, 41, 42, 43'
  });

  const [urlInput, setUrlInput] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const categoriesData = await productService.getAllCategories();
      setCategories(categoriesData || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      showAlert('Không thể tải danh sách danh mục!', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handler for Local File Select
  const handleLocalFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageList(prev => [...prev, {
          isFile: true,
          name: file.name,
          data: reader.result // Base64 encoding
        }]);
      };
      reader.readAsDataURL(file);
    });
    
    // Clear input to allow re-upload of same file
    e.target.value = '';
  };

  // Add Online Image URL
  const handleAddUrlImage = () => {
    if (!urlInput.trim()) {
      showAlert('Vui lòng nhập đường dẫn URL ảnh hợp lệ!', 'warning');
      return;
    }
    setImageList(prev => [...prev, {
      isFile: false,
      name: `Online Image ${prev.length + 1}`,
      data: urlInput.trim()
    }]);
    setUrlInput('');
  };

  // Remove Image from list
  const handleRemoveImage = (indexToRemove) => {
    setImageList(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price || !newProduct.categoryId) {
      showAlert('Vui lòng điền đầy đủ các thông tin bắt buộc!', 'warning');
      return;
    }

    setSubmitting(true);
    const finalSku = newProduct.skuCode || `SKU-${Date.now().toString().slice(-6)}`;
    const finalStock = parseInt(newProduct.stock) || 0;

    try {
      const colorsList = newProduct.colors.split(',').map(c => c.trim()).filter(Boolean);
      const sizesList = newProduct.sizes.split(',').map(s => parseFloat(s.trim())).filter(n => !isNaN(n));

      // Construct images array
      const productImages = imageList.map((img, idx) => ({
        name: img.name || `${newProduct.name} Image ${idx + 1}`,
        url: img.data // Base64 or online url
      }));

      // Fallback default image if empty
      if (productImages.length === 0) {
        productImages.push({
          name: newProduct.name + ' Default Image',
          url: 'https://via.placeholder.com/150'
        });
      }

      const payload = {
        name: newProduct.name,
        description: newProduct.description || 'Premium Aero-Tech engineered sports sneaker.',
        skuCode: finalSku,
        price: parseFloat(newProduct.price),
        oldPrice: parseFloat(newProduct.price),
        discountPercentage: 0,
        isNew: true,
        brand: newProduct.brand || 'Aero-Tech',
        colors: colorsList.length ? colorsList : ['Multicolor'],
        sizes: sizesList.length ? sizesList : [40, 41, 42],
        categoryId: parseInt(newProduct.categoryId),
        images: productImages
      };

      await productService.createProduct(payload);

      try {
        await axiosClient.post('/api/inventory', {
          skuCode: finalSku,
          quantity: finalStock
        }, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        });
      } catch (invErr) {
        console.error('Failed to auto-provision initial stock in inventory-service:', invErr);
      }

      showAlert('Thêm sản phẩm mới và cập nhật kho hàng thành công!', 'success');
      navigate('/admin/products');
    } catch (error) {
      console.error('Detailed Error adding product:', error);
      const serverMsg = error.response?.data?.message || error.response?.data?.error || error.message || 'Lỗi hệ thống';
      showAlert(`Không thể thêm sản phẩm! Chi tiết: ${serverMsg}`, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-container mx-auto mb-4"></div>
          <p className="text-zinc-500 font-bold">Đang tải cấu hình danh mục...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 w-full mx-auto">
      {/* Dynamic Glassmorphic Navigation Banner */}
      <div className="flex items-center justify-between bg-white border border-zinc-100 rounded-[32px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.015)] backdrop-blur-md">
        <div className="flex items-center gap-5">
          <button
            onClick={() => navigate('/admin/products')}
            className="w-12 h-12 rounded-2xl bg-zinc-50 border border-zinc-100 hover:bg-zinc-900 hover:text-white transition-all duration-300 flex items-center justify-center text-zinc-500 group"
          >
            <span className="material-symbols-outlined text-lg transition-transform duration-300 group-hover:-translate-x-1">arrow_back</span>
          </button>
          <div>
            <span className="bg-primary-container/10 text-primary-container text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full mb-1.5 inline-block">
              Product Creator
            </span>
            <h1 className="text-2xl font-space-grotesk font-black text-zinc-900 leading-none uppercase italic">
              Add New Product
            </h1>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase tracking-wider bg-zinc-50 px-5 py-3 rounded-2xl border border-zinc-100">
          <span>Products</span>
          <span className="material-symbols-outlined text-[10px]">chevron_right</span>
          <span className="text-primary-container font-black">Creator Room</span>
        </div>
      </div>

      {/* Main Beautiful Form Layout */}
      <form onSubmit={handleAddProduct} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col (2 cols): Core Info & Specifications */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Card 1: Core Identity */}
          <div className="bg-white rounded-[32px] p-8 border border-zinc-100 shadow-[0_20px_50px_rgba(0,0,0,0.02)] space-y-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-primary-container to-blue-400"></div>
            <div className="flex items-center gap-3 mb-2">
              <span className="material-symbols-outlined text-primary-container text-xl">identity_platform</span>
              <h2 className="text-sm font-black uppercase tracking-wider text-zinc-800">Core Identity</h2>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Tên sản phẩm *</label>
                <input
                  type="text"
                  required
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  placeholder="Ví dụ: Velocity Superlight Carbon X"
                  className="w-full bg-zinc-50 border border-zinc-100 hover:border-zinc-200 focus:border-primary-container rounded-2xl px-6 py-4 outline-none transition-all duration-300 font-bold text-sm text-zinc-800 placeholder:text-zinc-400"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Mô tả sản phẩm</label>
                <textarea
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  placeholder="Nhập mô tả chi tiết về tính năng, chất liệu và công nghệ của sản phẩm..."
                  rows="4"
                  className="w-full bg-zinc-50 border border-zinc-100 hover:border-zinc-200 focus:border-primary-container rounded-2xl px-6 py-4 outline-none transition-all duration-300 font-bold text-sm text-zinc-800 placeholder:text-zinc-400 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Technical Specifications */}
          <div className="bg-white rounded-[32px] p-8 border border-zinc-100 shadow-[0_20px_50px_rgba(0,0,0,0.02)] space-y-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-emerald-400 to-teal-400"></div>
            <div className="flex items-center gap-3 mb-2">
              <span className="material-symbols-outlined text-emerald-500 text-xl">tune</span>
              <h2 className="text-sm font-black uppercase tracking-wider text-zinc-800">Specifications & Attributes</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Mã SKU (Tự sinh nếu trống)</label>
                <input
                  type="text"
                  value={newProduct.skuCode}
                  onChange={(e) => setNewProduct({ ...newProduct, skuCode: e.target.value })}
                  placeholder="VELOCITY-SL-CARBON-X"
                  className="w-full bg-zinc-50 border border-zinc-100 hover:border-zinc-200 focus:border-primary-container rounded-2xl px-6 py-4 outline-none transition-all duration-300 font-bold text-sm text-zinc-800 placeholder:text-zinc-400"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Thương hiệu</label>
                <input
                  type="text"
                  value={newProduct.brand}
                  onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                  placeholder="Aero-Tech"
                  className="w-full bg-zinc-50 border border-zinc-100 hover:border-zinc-200 focus:border-primary-container rounded-2xl px-6 py-4 outline-none transition-all duration-300 font-bold text-sm text-zinc-800 placeholder:text-zinc-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Màu sắc (phân tách bằng dấu phẩy)</label>
                <input
                  type="text"
                  value={newProduct.colors}
                  onChange={(e) => setNewProduct({ ...newProduct, colors: e.target.value })}
                  placeholder="Space Black, Mercury Silver"
                  className="w-full bg-zinc-50 border border-zinc-100 hover:border-zinc-200 focus:border-primary-container rounded-2xl px-6 py-4 outline-none transition-all duration-300 font-bold text-sm text-zinc-800 placeholder:text-zinc-400"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Sizes (phân tách bằng dấu phẩy)</label>
                <input
                  type="text"
                  value={newProduct.sizes}
                  onChange={(e) => setNewProduct({ ...newProduct, sizes: e.target.value })}
                  placeholder="40, 41, 42, 43"
                  className="w-full bg-zinc-50 border border-zinc-100 hover:border-zinc-200 focus:border-primary-container rounded-2xl px-6 py-4 outline-none transition-all duration-300 font-bold text-sm text-zinc-800 placeholder:text-zinc-400"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Right Col (1 col): Logistics & Actions */}
        <div className="lg:col-span-1 space-y-8">
          
          {/* Card 3: Logistics (Price & Stock & Category) */}
          <div className="bg-white rounded-[32px] p-8 border border-zinc-100 shadow-[0_20px_50px_rgba(0,0,0,0.02)] space-y-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-amber-400 to-orange-400"></div>
            <div className="flex items-center gap-3 mb-2">
              <span className="material-symbols-outlined text-amber-500 text-xl">sell</span>
              <h2 className="text-sm font-black uppercase tracking-wider text-zinc-800">Logistics & Category</h2>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Giá bán ($) *</label>
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black font-space-grotesk text-zinc-400 text-sm">$</span>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    placeholder="2499.00"
                    className="w-full bg-zinc-50 border border-zinc-100 hover:border-zinc-200 focus:border-primary-container rounded-2xl pl-12 pr-6 py-4 outline-none transition-all duration-300 font-bold text-sm text-zinc-800 placeholder:text-zinc-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Tồn kho ban đầu *</label>
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 material-symbols-outlined text-zinc-400 text-lg">inventory</span>
                  <input
                    type="number"
                    required
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                    placeholder="150"
                    className="w-full bg-zinc-50 border border-zinc-100 hover:border-zinc-200 focus:border-primary-container rounded-2xl pl-14 pr-6 py-4 outline-none transition-all duration-300 font-bold text-sm text-zinc-800 placeholder:text-zinc-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Danh mục *</label>
                <div className="relative">
                  <select
                    required
                    value={newProduct.categoryId}
                    onChange={(e) => setNewProduct({ ...newProduct, categoryId: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-100 hover:border-zinc-200 focus:border-primary-container rounded-2xl px-6 py-4 outline-none transition-all duration-300 font-bold text-sm text-zinc-600 appearance-none cursor-pointer"
                  >
                    <option value="">-- Chọn danh mục thực --</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
                    <span className="material-symbols-outlined text-lg">unfold_more</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 4: Media Assets (Upload multi local images & Online URLs) */}
          <div className="bg-white rounded-[32px] p-8 border border-zinc-100 shadow-[0_20px_50px_rgba(0,0,0,0.02)] space-y-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-violet-400 to-purple-400"></div>
            <div className="flex items-center gap-3 mb-2">
              <span className="material-symbols-outlined text-violet-500 text-xl">collections</span>
              <h2 className="text-sm font-black uppercase tracking-wider text-zinc-800">Media Assets ({imageList.length})</h2>
            </div>

            <div className="space-y-4">
              {/* Option A: Upload Local File */}
              <div className="border-2 border-dashed border-zinc-200 hover:border-primary-container rounded-2xl p-6 text-center cursor-pointer transition-all duration-300 relative group bg-zinc-50/50">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleLocalFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <span className="material-symbols-outlined text-3xl text-zinc-400 group-hover:text-primary-container transition-colors">add_a_photo</span>
                <p className="text-xs font-bold text-zinc-600 mt-2">Dán hoặc Click để chọn ảnh từ máy</p>
                <p className="text-[10px] text-zinc-400 mt-1 font-semibold">Hỗ trợ JPG, PNG, WEBP (Tải nhiều file)</p>
              </div>

              {/* Option B: Enter Online URL */}
              <div className="space-y-2 pt-2 border-t border-zinc-100">
                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400">Thêm bằng link ảnh online (URL)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="Dán link Unsplash/CDN..."
                    className="flex-1 bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-3 outline-none text-xs font-bold text-zinc-800"
                  />
                  <button
                    type="button"
                    onClick={handleAddUrlImage}
                    className="bg-zinc-900 hover:bg-primary-container text-white px-4 rounded-xl text-xs font-black uppercase transition-colors"
                  >
                    Thêm
                  </button>
                </div>
              </div>

              {/* Image List Preview Carousel */}
              {imageList.length > 0 && (
                <div className="grid grid-cols-3 gap-3 pt-3 border-t border-zinc-100">
                  {imageList.map((img, idx) => (
                    <div key={idx} className="relative group border border-zinc-100 rounded-xl p-1 bg-zinc-50 aspect-square">
                      <img
                        src={img.data}
                        alt="Preview"
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-lg transition-transform scale-0 group-hover:scale-100 duration-200"
                      >
                        <span className="material-symbols-outlined text-xs">close</span>
                      </button>
                      <div className="absolute bottom-1 left-1 right-1 bg-black/60 text-white text-[8px] truncate px-1 rounded text-center">
                        {img.isFile ? 'Local' : 'Link'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="space-y-4">
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-primary-container hover:bg-zinc-950 text-white font-bold py-5 rounded-2xl shadow-[0_15px_30px_-5px_rgba(0,82,255,0.25)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-3 text-xs uppercase tracking-widest font-black disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ĐANG LƯU SẢN PHẨM...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm">cloud_upload</span>
                  Kích hoạt & Lưu sản phẩm
                </>
              )}
            </button>
            
            <button
              type="button"
              onClick={() => navigate('/admin/products')}
              className="w-full border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-500 hover:text-zinc-900 font-bold py-5 rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-3 text-xs uppercase tracking-widest font-black"
            >
              <span className="material-symbols-outlined text-sm">close</span>
              Hủy bỏ thay đổi
            </button>
          </div>

        </div>

      </form>
    </div>
  );
};

export default AdminAddProductPage;
