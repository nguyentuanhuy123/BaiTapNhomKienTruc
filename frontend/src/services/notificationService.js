// Persistent reactive state for Notifications using localStorage and real backend data
import { flashSaleService } from './flashSaleService';

let listeners = [];

// Load existing notifications from localStorage, or initialize with realistic defaults if empty
const getStoredNotifications = (key, defaultVal) => {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : defaultVal;
  } catch (e) {
    return defaultVal;
  }
};

let userNotifications = getStoredNotifications('user_notifications', [
  { id: 'fs-default-1', title: 'Đợt Flash Sale Sắp Diễn Ra!', message: 'Chuẩn bị săn giày Aero Knit X1 Pro giảm giá cực sâu vào ngày mai!', type: 'flash_sale', time: 'Mới cập nhật', read: false }
]);

let adminNotifications = getStoredNotifications('admin_notifications', [
  { id: 'admin-default-1', title: 'Hệ thống Flash Sale sẵn sàng', message: 'Tất cả các dịch vụ đã sẵn sàng cho đợt đẩy tải tiếp theo.', type: 'system', time: 'Mới cập nhật', read: false }
]);

const saveNotifications = () => {
  try {
    localStorage.setItem('user_notifications', JSON.stringify(userNotifications));
    localStorage.setItem('admin_notifications', JSON.stringify(adminNotifications));
  } catch (e) {
    console.warn('Could not save notifications to localStorage:', e);
  }
};

export const notificationService = {
  subscribe(callback) {
    listeners.push(callback);
    // Automatically trigger initial sync when a new component subscribes
    this.syncWithBackend();
    return () => {
      listeners = listeners.filter(l => l !== callback);
    };
  },

  notify() {
    saveNotifications();
    listeners.forEach(callback => callback());
  },

  getUserNotifications() {
    return userNotifications;
  },

  getAdminNotifications() {
    return adminNotifications;
  },

  markUserAllAsRead() {
    userNotifications = userNotifications.map(n => ({ ...n, read: true }));
    this.notify();
  },

  markAdminAllAsRead() {
    adminNotifications = adminNotifications.map(n => ({ ...n, read: true }));
    this.notify();
  },

  addUserNotification(title, message, type = 'general') {
    const newNotif = {
      id: String(Date.now()),
      title,
      message,
      type,
      time: 'Vừa xong',
      read: false
    };
    userNotifications = [newNotif, ...userNotifications];
    this.notify();
    this.triggerToast(title, message);
  },

  addAdminNotification(title, message, type = 'general') {
    const newNotif = {
      id: String(Date.now()),
      title,
      message,
      type,
      time: 'Vừa xong',
      read: false
    };
    adminNotifications = [newNotif, ...adminNotifications];
    this.notify();
    this.triggerToast(`[ADMIN] ${title}`, message);
  },

  triggerToast(title, message) {
    const event = new CustomEvent('app-toast', { detail: { title, message } });
    window.dispatchEvent(event);
  },

  /**
   * Fetch real campaigns from Backend and sync with User/Admin notifications list
   */
  async syncWithBackend() {
    try {
      // 1. Fetch campaigns from Flash Sale microservice
      const allCampaigns = await flashSaleService.getAllCampaigns();
      if (!allCampaigns || allCampaigns.length === 0) return;

      const now = Date.now();
      let updated = false;

      // Sync active & scheduled campaigns to notifications
      allCampaigns.forEach(camp => {
        const userNotifId = `fs-user-${camp.id}`;
        const adminNotifId = `fs-admin-${camp.id}`;

        if (camp.status === 'ACTIVE' && !userNotifications.some(n => n.id === userNotifId)) {
          // Add notification to User
          const newNotif = {
            id: userNotifId,
            title: `🔥 FLASH SALE: ${camp.name}!`,
            message: `Sự kiện giảm giá cực sốc đã bắt đầu! Rất nhiều mẫu giày chạy chuyên nghiệp đang mở bán với giá sập sàn. Mua ngay kẻo lỡ!`,
            type: 'flash_sale',
            time: 'Mới cập nhật',
            read: false
          };
          userNotifications = [newNotif, ...userNotifications];
          this.triggerToast(newNotif.title, newNotif.message);
          updated = true;
        }

        if (!adminNotifications.some(n => n.id === adminNotifId)) {
          // Add notification to Admin
          const statusText = camp.status === 'ACTIVE' ? 'đang diễn ra sôi động' : 'đã được lên lịch mở bán thành công';
          const newNotif = {
            id: adminNotifId,
            title: `Chiến dịch: ${camp.name}`,
            message: `Chiến dịch Flash Sale ${statusText} lúc ${new Date(camp.startTime).toLocaleString('vi-VN')}. Hệ thống đã nạp kho ảo lên RAM Hazelcast.`,
            type: 'campaign',
            time: 'Mới cập nhật',
            read: false
          };
          adminNotifications = [newNotif, ...adminNotifications];
          updated = true;
        }
      });
      // Save active flash sale product IDs to localStorage so other pages (like Explore) can check instantly!
      const activeCamp = allCampaigns.find(c => c.status === 'ACTIVE');
        if (activeCamp) {
          const activeProds = (activeCamp.products || []).map(p => ({
            productId: p.productId,
            salePrice: p.salePrice,
            campaignName: activeCamp.name
          }));
          localStorage.setItem('active_flash_sale_products', JSON.stringify(activeProds));
        } else {
          localStorage.removeItem('active_flash_sale_products');
        }

        if (updated) {
          this.notify();
        }
      } catch (e) {
        console.log('Skipping notification backend sync: Backend is not active or empty.');
      }
    }
};

