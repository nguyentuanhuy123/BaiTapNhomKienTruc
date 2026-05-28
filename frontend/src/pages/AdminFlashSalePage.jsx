import React, { useState, useEffect } from 'react';
import { flashSaleService } from '../services/flashSaleService';
import { productService } from '../services/productService';
import { useAlert } from '../contexts/AlertContext';
import axiosClient from '../api/axiosClient';

const AdminFlashSalePage = () => {
  const { showAlert } = useAlert();
  const [dbProducts, setDbProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState([]);

  // Form states for creating a new Campaign
  const [campaignName, setCampaignName] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]); // [{productId, salePrice, stock}]
  
  // Single product selection state to add to the campaign list
  const [currentProdId, setCurrentProdId] = useState('');
  const [currentSalePrice, setCurrentSalePrice] = useState('');
  const [currentQty, setCurrentQty] = useState(50);
  
  const [submittingCampaign, setSubmittingCampaign] = useState(false);

  // Monitor stock levels from Hazelcast RAM
  const [monitoredProducts, setMonitoredProducts] = useState([]);

  useEffect(() => {
    fetchRealProducts();
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const data = await flashSaleService.getAllCampaigns();
      setCampaigns(data || []);
    } catch (e) {
      console.warn('Could not load campaigns:', e);
    }
  };

  const fetchRealProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getAllProducts(0, 100);
      const rawProducts = data.content || [];

      // Query database inventory-service levels for each product to get actual stock
      let inventoryMap = {};
      try {
        const skuCodes = rawProducts.map(p => p.skuCode).filter(Boolean);
        if (skuCodes.length > 0) {
          const invRes = await axiosClient.get(`/api/inventory`, {
            params: { skuCode: skuCodes.join(',') }
          });
          if (Array.isArray(invRes.data)) {
            invRes.data.forEach(item => {
              inventoryMap[item.skuCode] = item.quantity !== undefined && item.quantity !== null ? item.quantity : 0;
            });
          }
        }
      } catch (invErr) {
        console.warn('Could not query inventory-service database stock levels:', invErr);
      }
      
      const mapped = rawProducts.map(p => {
        const stock = (p.skuCode && inventoryMap[p.skuCode] !== undefined && inventoryMap[p.skuCode] !== null)
          ? inventoryMap[p.skuCode]
          : 0;
        return {
          id: p.skuCode || String(p.id),
          name: p.name || 'N/A',
          dbStock: stock,
          originalPrice: p.price || 0,
          currentStock: 0
        };
      });

      setDbProducts(mapped);
      setMonitoredProducts(mapped);
    } catch (err) {
      console.error('Error loading real products:', err);
      showAlert('Không thể tải danh sách sản phẩm thực từ hệ thống!', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Poll real-time RAM stocks from Hazelcast every 3 seconds
  useEffect(() => {
    if (monitoredProducts.length === 0) return;

    const updateStocks = async () => {
      const updated = await Promise.all(
        monitoredProducts.map(async (prod) => {
          try {
            const stockInfo = await flashSaleService.getRealtimeStock(prod.id);
            return { ...prod, currentStock: stockInfo.currentStock };
          } catch (e) {
            return { ...prod, currentStock: 0 };
          }
        })
      );
      setMonitoredProducts(updated);
    };

    updateStocks();
    const interval = setInterval(updateStocks, 3000);
    return () => clearInterval(interval);
  }, [dbProducts]);

  const handleAddProductToCampaign = () => {
    if (!currentProdId || !currentSalePrice || currentQty <= 0) {
      showAlert('Vui lòng chọn sản phẩm, giá bán và điền số lượng hợp lệ!', 'error');
      return;
    }

    const matchedProd = dbProducts.find(p => p.id === currentProdId);
    if (!matchedProd) return;

    if (currentQty > matchedProd.dbStock) {
      showAlert(`Số lượng nạp Flash Sale (${currentQty}) vượt quá tồn kho thực tế (${matchedProd.dbStock})!`, 'warning');
      return;
    }

    if (parseFloat(currentSalePrice) >= matchedProd.originalPrice) {
      showAlert(`Giá Flash Sale phải nhỏ hơn giá gốc thực tế (${matchedProd.originalPrice.toLocaleString('vi-VN')}đ)!`, 'warning');
      return;
    }

    // Check duplicate
    if (selectedProducts.some(p => p.productId === currentProdId)) {
      showAlert('Sản phẩm này đã được thêm vào danh sách chiến dịch!', 'warning');
      return;
    }

    setSelectedProducts(prev => [
      ...prev,
      {
        productId: currentProdId,
        name: matchedProd.name,
        stock: parseInt(currentQty),
        salePrice: parseFloat(currentSalePrice),
        originalPrice: matchedProd.originalPrice
      }
    ]);

    // Reset single selection form
    setCurrentProdId('');
    setCurrentSalePrice('');
    setCurrentQty(50);
  };

  const handleRemoveProductFromCampaign = (prodId) => {
    setSelectedProducts(prev => prev.filter(p => p.productId !== prodId));
  };

  const handleCreateCampaign = async (e) => {
    e.preventDefault();

    if (!campaignName || !startTime || !endTime) {
      showAlert('Vui lòng nhập đầy đủ tên chiến dịch, thời gian bắt đầu và kết thúc!', 'error');
      return;
    }

    const startMillis = new Date(startTime).getTime();
    const endMillis = new Date(endTime).getTime();

    if (startMillis >= endMillis) {
      showAlert('Thời gian kết thúc phải lớn hơn thời gian bắt đầu!', 'error');
      return;
    }

    if (selectedProducts.length === 0) {
      showAlert('Vui lòng thêm ít nhất một sản phẩm vào chiến dịch!', 'error');
      return;
    }

    setSubmittingCampaign(true);

    try {
      const campaignPayload = {
        name: campaignName,
        startTime: startMillis,
        endTime: endMillis,
        products: selectedProducts.map(p => ({
          productId: p.productId,
          name: p.name,
          stock: p.stock,
          salePrice: p.salePrice
        }))
      };

      await flashSaleService.createCampaign(campaignPayload);
      showAlert(`Đã lên lịch chiến dịch Flash Sale "${campaignName}" thành công!`, 'success');
      
      // Reset main form
      setCampaignName('');
      setStartTime('');
      setEndTime('');
      setSelectedProducts([]);
      
      fetchCampaigns();
    } catch (err) {
      console.error(err);
      showAlert('Không thể khởi tạo chiến dịch! Vui lòng kiểm tra lại Backend.', 'error');
    } finally {
      setSubmittingCampaign(false);
    }
  };

  const selectedProductInfo = dbProducts.find(p => p.id === currentProdId);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-container mx-auto mb-4"></div>
          <p className="text-zinc-500 font-bold">Đang tải dữ liệu và cấu hình hệ thống...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 w-full pb-16">
      {/* Header Section */}
      <div>
        <span className="bg-primary-container/10 text-primary-container text-xs px-4 py-1.5 rounded-full font-black uppercase tracking-widest mb-4 inline-block">
          Admin Control Center
        </span>
        <h1 className="text-4xl font-space-grotesk font-black text-zinc-900 leading-none uppercase italic">
          Flash Sale Scheduler
        </h1>
        <p className="text-zinc-500 mt-2 text-sm">
          Quản trị viên: Thiết kế chiến dịch, đặt giờ mở bán, thiết lập giá sốc và theo dõi lượng tồn kho ảo trên RAM Hazelcast thời gian thực.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Cột Trái: Form Lên Lịch & Quản Lý Chiến Dịch */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Form Thiết lập Chiến Dịch mới */}
          <div className="bg-white rounded-3xl p-8 border border-zinc-100 shadow-[0_20px_50px_rgba(0,0,0,0.02)]">
            <h2 className="text-xl font-bold font-space-grotesk text-zinc-900 mb-6 uppercase flex items-center gap-3">
              <span className="material-symbols-outlined text-primary-container">calendar_month</span>
              Thiết kế chiến dịch Flash Sale mới
            </h2>

            <form onSubmit={handleCreateCampaign} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-3">
                  <label className="block text-xs font-black uppercase tracking-wider text-zinc-500 mb-2">Tên chiến dịch *</label>
                  <input
                    type="text"
                    required
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                    placeholder="Ví dụ: Flash Sale Hè Rực Rỡ 2026"
                    className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-primary-container transition-all font-bold text-sm text-zinc-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-zinc-500 mb-2">Giờ bắt đầu *</label>
                  <input
                    type="datetime-local"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-primary-container transition-all font-bold text-sm text-zinc-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-zinc-500 mb-2">Giờ kết thúc *</label>
                  <input
                    type="datetime-local"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-primary-container transition-all font-bold text-sm text-zinc-600"
                  />
                </div>
              </div>

              {/* Box chọn thêm sản phẩm khuyến mãi */}
              <div className="p-6 bg-zinc-50 rounded-3xl border border-zinc-100 space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500">Thêm sản phẩm mở bán sốc</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                  <div className="md:col-span-5">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-1">Chọn mẫu giày chạy</label>
                    <select
                      value={currentProdId}
                      onChange={(e) => setCurrentProdId(e.target.value)}
                      className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary-container transition-all font-bold text-xs text-zinc-600"
                    >
                      <option value="">-- Chọn giày --</option>
                      {dbProducts.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} (Tồn: {p.dbStock} đôi &bull; Giá: {p.originalPrice.toLocaleString('vi-VN')}đ)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-1">Giá Flash Sale (VNĐ)</label>
                    <input
                      type="number"
                      value={currentSalePrice}
                      onChange={(e) => setCurrentSalePrice(e.target.value)}
                      placeholder="Ví dụ: 199000"
                      className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary-container transition-all font-bold text-xs"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-1">Số lượng mở bán</label>
                    <input
                      type="number"
                      value={currentQty}
                      onChange={(e) => setCurrentQty(parseInt(e.target.value) || 0)}
                      min="1"
                      className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary-container transition-all font-bold text-xs"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <button
                      type="button"
                      onClick={handleAddProductToCampaign}
                      className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-3 rounded-xl transition-all text-xs tracking-wider font-black flex items-center justify-center gap-1"
                    >
                      <span className="material-symbols-outlined text-sm">add</span> Thêm
                    </button>
                  </div>
                </div>

                {selectedProductInfo && (
                  <div className="text-[10px] text-amber-600 bg-amber-50 rounded-lg p-2 font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-xs">info</span>
                    Tồn kho tối đa cho phép: {selectedProductInfo.dbStock} đôi &bull; Giá gốc ban đầu: {selectedProductInfo.originalPrice.toLocaleString('vi-VN')}đ
                  </div>
                )}

                {/* Danh sách sản phẩm đã được chọn */}
                {selectedProducts.length > 0 && (
                  <div className="mt-4 border-t border-zinc-200/60 pt-4 space-y-2 max-h-48 overflow-y-auto pr-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Danh sách khuyến mại đã chọn ({selectedProducts.length}):</p>
                    {selectedProducts.map((p) => (
                      <div key={p.productId} className="flex justify-between items-center p-3 bg-white rounded-xl border border-zinc-200/50 text-xs">
                        <div>
                          <p className="font-bold text-zinc-800">{p.name}</p>
                          <p className="text-[10px] text-zinc-400 font-bold uppercase mt-0.5">
                            SKU: {p.productId} &bull; Số lượng: {p.stock} đôi &bull; Giá Flash: <span className="text-red-500 font-black">{p.salePrice.toLocaleString('vi-VN')}đ</span> (Gốc: {p.originalPrice.toLocaleString('vi-VN')}đ)
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveProductFromCampaign(p.productId)}
                          className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-1.5 rounded-lg transition-all"
                        >
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={submittingCampaign}
                className="w-full bg-primary-container text-white font-bold py-5 rounded-2xl shadow-[0_15px_30px_-5px_rgba(0,82,255,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 text-xs uppercase tracking-widest font-black"
              >
                <span className="material-symbols-outlined text-sm">bolt</span>
                {submittingCampaign ? 'ĐANG KHỞI TẠO CHIẾN DỊCH...' : 'KÍCH HOẠT & LÊN LỊCH CHIẾN DỊCH FLASH SALE'}
              </button>
            </form>
          </div>

          {/* Danh sách các chiến dịch đã lên lịch */}
          <div className="bg-white rounded-3xl p-8 border border-zinc-100 shadow-[0_20px_50px_rgba(0,0,0,0.02)]">
            <h2 className="text-xl font-bold font-space-grotesk text-zinc-900 mb-6 uppercase flex items-center gap-3">
              <span className="material-symbols-outlined text-zinc-700">list_alt</span>
              Các chiến dịch Flash Sale hệ thống
            </h2>

            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
              {campaigns.length === 0 ? (
                <div className="text-center py-10 bg-zinc-50 rounded-2xl border border-zinc-100 text-zinc-400 text-xs">
                  Chưa có chiến dịch Flash Sale nào được tạo!
                </div>
              ) : (
                campaigns.map((camp) => (
                  <div key={camp.id} className="p-5 bg-zinc-50 rounded-2xl border border-zinc-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-zinc-200 transition-all">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-zinc-800 uppercase italic text-sm">{camp.name}</h3>
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase ${
                          camp.status === 'ACTIVE' ? 'bg-green-100 text-green-700 animate-pulse' :
                          camp.status === 'SCHEDULED' ? 'bg-amber-100 text-amber-700' :
                          'bg-zinc-200 text-zinc-500'
                        }`}>
                          {camp.status}
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mt-1">
                        Bắt đầu: {new Date(camp.startTime).toLocaleString('vi-VN')} &bull; Kết thúc: {new Date(camp.endTime).toLocaleString('vi-VN')}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-[10px] text-zinc-500 font-bold uppercase">Sản phẩm khuyến mại: {camp.products ? camp.products.length : 0} mẫu</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Bảng Monitor Real-time (Hazelcast RAM) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-8 border border-zinc-100 shadow-[0_20px_50px_rgba(0,0,0,0.02)] flex flex-col h-[700px]">
          <h2 className="text-xl font-bold font-space-grotesk text-zinc-900 mb-6 uppercase flex items-center gap-3">
            <span className="material-symbols-outlined text-green-500">monitoring</span>
            RAM Stock Monitor
          </h2>

          <div className="flex-1 space-y-4 overflow-y-auto pr-2">
            {monitoredProducts.map((prod) => (
              <div key={prod.id} className="flex justify-between items-center p-4 bg-zinc-50 rounded-2xl border border-zinc-100 hover:border-zinc-200 transition-all">
                <div className="max-w-[60%]">
                  <p className="font-bold text-zinc-900 uppercase italic text-xs truncate">{prod.name}</p>
                  <p className="text-[9px] text-zinc-400 font-bold uppercase mt-1 truncate">DB Stock: {prod.dbStock} đôi</p>
                </div>

                <div className="text-right">
                  <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase text-white shadow-md inline-block ${prod.currentStock > 0 ? 'bg-green-600' : 'bg-red-500'}`}>
                    RAM: {prod.currentStock}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl bg-primary-container/5 p-4 border border-primary-container/10">
            <p className="text-[10px] text-primary-container leading-relaxed flex items-start gap-2">
              <span className="material-symbols-outlined text-xs mt-0.5">info</span>
              <span>
                Trực quan hóa lượng tồn kho ảo trên **Hazelcast RAM cluster** được nạp tự động qua bộ Scheduler.
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminFlashSalePage;
