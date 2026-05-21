import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

const AlertContext = createContext();

export const AlertProvider = ({ children }) => {
  const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });
  
  // Dùng useRef để quản lý timeout, tránh việc tạo ra nhiều timer chồng chéo
  const timeoutRef = useRef(null);

  /**
   * Hàm hiển thị thông báo
   * @param {string} message - Nội dung thông báo
   * @param {'success' | 'error'} type - Loại thông báo
   * @param {number} duration - Thời gian hiển thị (ms)
   */
  const showAlert = useCallback((message, type = 'success', duration = 3000) => {
    // Nếu đang có một timeout chạy, hãy xóa nó đi trước khi tạo cái mới
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setAlert({ show: true, message, type });

    // Tự động đóng sau 'duration' ms
    timeoutRef.current = setTimeout(() => {
      setAlert((prev) => ({ ...prev, show: false }));
    }, duration);
  }, []);

  // Hàm đóng thông báo thủ công
  const hideAlert = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setAlert((prev) => ({ ...prev, show: false }));
  };

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}

      {/* UI của Alert Toast */}
      {alert.show && (
        <div className="fixed top-5 right-5 z-[1002] animate-fade-in-left">
          <div 
            className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border transition-all duration-300 ${
              alert.type === 'success' 
                ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
                : 'bg-red-50 border-red-100 text-red-700'
            }`}
          >
            {/* Icon */}
            <span className="material-symbols-outlined text-[24px]">
              {alert.type === 'success' ? 'check_circle' : 'error'}
            </span>

            {/* Nội dung */}
            <div className="flex flex-col">
              <p className="font-bold text-sm leading-tight">
                {alert.type === 'success' ? 'Thành công' : 'Có lỗi xảy ra'}
              </p>
              <p className="text-xs opacity-90">{alert.message}</p>
            </div>

            {/* Nút đóng */}
            <button 
              onClick={hideAlert} 
              className="ml-4 p-1 hover:bg-black/5 rounded-full transition-colors opacity-50 hover:opacity-100"
            >
              <span className="material-symbols-outlined text-sm block">close</span>
            </button>
          </div>
        </div>
      )}
    </AlertContext.Provider>
  );
};

// Hook tùy chỉnh để sử dụng Alert nhanh hơn
export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert phải được đặt trong AlertProvider');
  }
  return context;
};