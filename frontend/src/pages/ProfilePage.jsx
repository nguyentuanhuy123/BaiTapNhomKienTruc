import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import userApi from '../api/userApi';
import authApi from '../api/authApi';
import { useAlert } from '../contexts/AlertContext';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

// ─── Shared PasswordInput ─────────────────────────────────────────────────────
const PasswordInput = ({ name, label, value, onChange, autoComplete, minLength }) => {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-2">
        {label}
      </label>
      <div className="relative">
        <input
          name={name}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          required
          autoComplete={autoComplete}
          minLength={minLength}
          className="w-full border border-zinc-200 rounded-2xl px-5 py-3 pr-12 text-sm font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-primary-container transition"
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 transition-colors"
          tabIndex={-1}
        >
          <span className="material-symbols-outlined text-xl">
            {show ? 'visibility_off' : 'visibility'}
          </span>
        </button>
      </div>
    </div>
  );
};

// ─── Edit Profile Modal ───────────────────────────────────────────────────────
const EditProfileModal = ({ userData, onClose, onSaved }) => {
  const { showAlert } = useAlert();
  const [form, setForm] = useState({
    fullName: userData.fullName || '',
    phone: userData.phone || '',
    address: userData.address || '',
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);
    try {
      // Giả sử bạn có hàm updateProfile trong userApi
      const updated = await userApi.updateProfile(form); 
      showAlert('Cập nhật thông tin thành công!', 'success');
      onSaved(updated); // Cập nhật lại state ở trang ProfilePage
      onClose();
    } catch (err) {
      showAlert('Cập nhật thất bại, vui lòng thử lại.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-[32px] p-10 w-full max-w-lg shadow-2xl">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-xl font-black uppercase tracking-tight text-zinc-900">
            Edit Profile
          </h3>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-700 transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Full Name */}
          <div>
            <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-2">
              Full Name
            </label>
            <input
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              required
              minLength={2}
              maxLength={100}
              className="w-full border border-zinc-200 rounded-2xl px-5 py-3 text-sm font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-primary-container transition"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-2">
              Phone Number
            </label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              required
              pattern="^(0[35789])[0-9]{8}$"
              title="Số điện thoại không hợp lệ (VD: 0901234567)"
              className="w-full border border-zinc-200 rounded-2xl px-5 py-3 text-sm font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-primary-container transition"
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-2">
              Address
            </label>
            <textarea
              name="address"
              value={form.address}
              onChange={handleChange}
              required
              rows={3}
              className="w-full border border-zinc-200 rounded-2xl px-5 py-3 text-sm font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-primary-container transition resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-zinc-200 text-zinc-600 font-black py-4 rounded-2xl text-xs uppercase tracking-widest hover:bg-zinc-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-primary-container text-white font-black py-4 rounded-2xl text-xs uppercase tracking-widest hover:opacity-90 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <span className="animate-spin w-4 h-4 border-2 border-white/40 border-t-white rounded-full" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Change Password Modal ────────────────────────────────────────────────────
const ChangePasswordModal = ({ onClose }) => {
  const { showAlert } = useAlert();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [saving, setSaving] = useState(false);
  const [strength, setStrength] = useState(0); // 0-4

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === 'newPassword') setStrength(calcStrength(value));
  };

  // Tính độ mạnh mật khẩu đơn giản
  const calcStrength = (pwd) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strengthLabel = ['', 'Yếu', 'Trung bình', 'Khá mạnh', 'Rất mạnh'][strength];
  const strengthColor = ['', 'bg-red-400', 'bg-amber-400', 'bg-blue-400', 'bg-green-500'][strength];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.newPassword !== form.confirmPassword) {
      showAlert('Mật khẩu xác nhận không khớp!', 'error');
      return;
    }
    if (form.newPassword.length < 8) {
      showAlert('Mật khẩu mới phải có ít nhất 8 ký tự.', 'error');
      return;
    }

    setSaving(true);
    try {
      await authApi.changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
        confirmPassword: form.confirmPassword,
      });

      showAlert('Đổi mật khẩu thành công! Vui lòng đăng nhập lại.', 'success');

      // Backend đã thu hồi toàn bộ session → logout ngay trên FE
      setTimeout(() => {
        logout();
        navigate("/login")
      }, 1500);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data ||
        'Đổi mật khẩu thất bại, vui lòng thử lại.';
      showAlert(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-[32px] p-10 w-full max-w-lg shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-container/10 rounded-2xl flex items-center justify-center">
              <span className="material-symbols-outlined text-primary-container text-lg">lock</span>
            </div>
            <h3 className="text-xl font-black uppercase tracking-tight text-zinc-900">
              Change Password
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-700 transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <p className="text-zinc-400 text-xs mb-8 ml-[52px]">
          Sau khi đổi mật khẩu, bạn sẽ được đăng xuất khỏi tất cả thiết bị.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Current Password */}
          <PasswordInput
            name="currentPassword"
            label="Current Password"
            value={form.currentPassword}
            onChange={handleChange}
            autoComplete="current-password"
          />

          {/* New Password + Strength meter */}
          <div>
            <PasswordInput
              name="newPassword"
              label="New Password"
              value={form.newPassword}
              onChange={handleChange}
              autoComplete="new-password"
              minLength={8}
            />
            {/* Strength bar */}
            {form.newPassword.length > 0 && (
              <div className="mt-2 flex items-center gap-3">
                <div className="flex-1 flex gap-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`h-1.5 flex-1 rounded-full transition-all ${
                        i <= strength ? strengthColor : 'bg-zinc-100'
                      }`}
                    />
                  ))}
                </div>
                <span className={`text-[10px] font-black uppercase tracking-wider ${
                  strength <= 1 ? 'text-red-400' :
                  strength === 2 ? 'text-amber-400' :
                  strength === 3 ? 'text-blue-400' : 'text-green-500'
                }`}>
                  {strengthLabel}
                </span>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <PasswordInput
              name="confirmPassword"
              label="Confirm New Password"
              value={form.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
            />
            {/* Match indicator */}
            {form.confirmPassword.length > 0 && (
              <p className={`mt-1.5 text-[11px] font-bold flex items-center gap-1 ${
                form.newPassword === form.confirmPassword ? 'text-green-500' : 'text-red-400'
              }`}>
                <span className="material-symbols-outlined text-sm">
                  {form.newPassword === form.confirmPassword ? 'check_circle' : 'cancel'}
                </span>
                {form.newPassword === form.confirmPassword ? 'Mật khẩu khớp' : 'Chưa khớp'}
              </p>
            )}
          </div>

          {/* Warning notice */}
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-2xl px-4 py-3">
            <span className="material-symbols-outlined text-amber-400 text-lg mt-0.5">info</span>
            <p className="text-xs text-amber-700 font-medium leading-relaxed">
              Vì lý do bảo mật, tất cả phiên đăng nhập sẽ bị thu hồi sau khi đổi mật khẩu.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-zinc-200 text-zinc-600 font-black py-4 rounded-2xl text-xs uppercase tracking-widest hover:bg-zinc-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-primary-container text-white font-black py-4 rounded-2xl text-xs uppercase tracking-widest hover:opacity-90 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <span className="animate-spin w-4 h-4 border-2 border-white/40 border-t-white rounded-full" />
                  Updating...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm">lock_reset</span>
                  Update Password
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


// ─── Logout All Devices Modal ─────────────────────────────────────────────────
const LogoutAllModal = ({ onClose, onConfirmed }) => {
  const { showAlert } = useAlert();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) throw new Error('No refresh token');
      await authApi.logoutAllDevices(refreshToken);
      showAlert('Đã đăng xuất khỏi tất cả thiết bị!', 'success');
      setTimeout(() => {
        onConfirmed(); // gọi logout() từ AuthContext → clear localStorage
        navigate("/login")
      }, 1000);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.';
      showAlert(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-[32px] p-10 w-full max-w-md shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-2xl flex items-center justify-center">
              <span className="material-symbols-outlined text-red-500 text-lg">devices_off</span>
            </div>
            <h3 className="text-xl font-black uppercase tracking-tight text-zinc-900">
              Logout All Devices
            </h3>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-700 transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <p className="text-sm text-zinc-500 leading-relaxed mb-2">
          Thao tác này sẽ <span className="font-bold text-zinc-800">đăng xuất tất cả các phiên đăng nhập</span> trên mọi thiết bị,
          bao gồm cả thiết bị hiện tại.
        </p>
        <p className="text-sm text-zinc-400 mb-8">Bạn sẽ cần đăng nhập lại để tiếp tục sử dụng.</p>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 border border-zinc-200 text-zinc-600 font-black py-4 rounded-2xl text-xs uppercase tracking-widest hover:bg-zinc-50 transition-all disabled:opacity-60"
          >
            Huỷ
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 bg-red-500 text-white font-black py-4 rounded-2xl text-xs uppercase tracking-widest hover:bg-red-600 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="animate-spin w-4 h-4 border-2 border-white/40 border-t-white rounded-full" />
                Processing...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-sm">logout</span>
                Confirm Logout
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── ProfilePage ──────────────────────────────────────────────────────────────
const ProfilePage = () => {
  const { showAlert } = useAlert();
  const { logout } = useAuth();
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showLogoutAllModal, setShowLogoutAllModal] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const avatarInputRef = useRef(null);

  // --- MOCK DATA CHO ORDERS ---
  const recentOrders = [
    {
      id: '#VL-90821',
      product: 'VELOCITY AIR MAX X1',
      date: 'May 12, 2024',
      total: 220.0,
      status: 'DELIVERED',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuDlNG2P_20pGAAH4lD1LeB5XUPjnnrFc1Iqelb0yK_m5pU8LBE-r1o2Qc0s98A3ibTFLgTBWkOL_Of5_oOH0uULbeky0x39_KUNX_WWNODTJMDKHAAG_xht_x1U0gWH71RRXbW_ZtO1ozzj1yI-3cDWy7ha4kOLfSxqzcFYN7BgdKbZ3lfnDHt2k0E7f0EimKNABOUGiiHM7MyaiARflxSGkXj5a0rOM8LI-ylmoHgcPxKHEJvRV5XyWWxtRcZzNNk7Ff5qopsRjeM',
    },
    {
      id: '#VL-88219',
      product: 'CLOUD RACER 2.0',
      date: 'May 08, 2024',
      total: 185.0,
      status: 'IN TRANSIT',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAz8dC1bhFHEAQ2mtNFLQZxqJmpjz1uJPQ9tyYXoNc7rwV15o7-D75288YdtAAKKdypNXvg0TQPkXwx4KrxVYtGLy1Y8QFAJn59CzNJ5ZIWzxeEPSWLJfwOaVcrAYiFm2wa2WCcg3BqmSlLGKsurmYPaiVyBpPBX8RxDPfdD_cljsNm3rmYifWKbkTaYmRTu4dlqrzVuyXY6Dwy_rNMSZ7ANnXgxhHwSNqWEo--SpdWOepwnSFNzUCcqqtmsZdRJbbjCUv5yW_MigY',
    },
  ];

  // --- Load user data ---
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const userEmail = localStorage.getItem('userEmail');
        if (!userEmail) {
          showAlert('Không tìm thấy thông tin phiên đăng nhập', 'error');
          setIsLoading(false);
          return;
        }
        const data = await userApi.getCurrentUser();
        setUserData(data);
      } catch (error) {
        console.error('Error fetching profile:', error);
        showAlert('Không thể tải thông tin cá nhân', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserProfile();
  }, []);

  // --- Avatar upload handler ---
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showAlert('Chỉ chấp nhận file ảnh', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showAlert('Ảnh không được vượt quá 5MB', 'error');
      return;
    }

    setAvatarUploading(true);
    try {
      const updated = await userApi.updateAvatar(file);
      setUserData(updated);
      showAlert('Cập nhật avatar thành công!', 'success');
    } catch (err) {
      console.error('Avatar upload error:', err);
      showAlert('Không thể upload ảnh, vui lòng thử lại.', 'error');
    } finally {
      setAvatarUploading(false);
      if (avatarInputRef.current) avatarInputRef.current.value = '';
    }
  };

  // --- Loading / empty states ---
  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-zinc-50/50 items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-container" />
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="text-center mt-20">Không tìm thấy dữ liệu người dùng.</div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50/50">
      <Navbar />

      {/* Edit Profile Modal */}
      {showEditModal && (
        <EditProfileModal
          userData={userData}
          onClose={() => setShowEditModal(false)}
          onSaved={(updated) => setUserData(updated)}
        />
      )}

      {/* Change Password Modal */}
      {showChangePasswordModal && (
        <ChangePasswordModal
          onClose={() => setShowChangePasswordModal(false)}
        />
      )}

      {/* Logout All Devices Modal */}
      {showLogoutAllModal && (
        <LogoutAllModal
          onClose={() => setShowLogoutAllModal(false)}
          onConfirmed={logout}
        />
      )}

      <main className="flex-1 pt-24 pb-20 px-margin-mobile md:px-margin-desktop max-w-[1100px] mx-auto w-full">
        {/* Top Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">

          {/* Personal Info Card */}
          <div className="lg:col-span-2 bg-white rounded-[40px] p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
            <div className="flex justify-between items-start mb-10">
              <h2 className="text-2xl font-bold text-zinc-900 uppercase tracking-tight">
                Personal Information
              </h2>
              <button
                onClick={() => setShowEditModal(true)}
                className="bg-zinc-100 hover:bg-zinc-200 text-zinc-600 px-6 py-2 rounded-full text-xs font-bold transition-all"
              >
                Edit Profile
              </button>
            </div>

            {/* Avatar + name */}
            <div className="flex items-center gap-8 mb-12">
              <div className="relative group">
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
                <button
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={avatarUploading}
                  className="relative focus:outline-none"
                  title="Đổi avatar"
                >
                  {avatarUploading && (
                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center z-10">
                      <span className="animate-spin w-6 h-6 border-2 border-white/40 border-t-white rounded-full" />
                    </div>
                  )}
                  <img
                    src={userData.avatarUrl || 'https://via.placeholder.com/150'}
                    alt={userData.fullName}
                    className="w-24 h-24 rounded-full object-cover border-4 border-zinc-50"
                  />
                  <div className="absolute bottom-0 right-0 w-8 h-8 bg-primary-container text-white rounded-full flex items-center justify-center border-2 border-white group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-sm">photo_camera</span>
                  </div>
                </button>
              </div>
              <div>
                <h1 className="text-3xl font-black font-space-grotesk text-zinc-900 tracking-tight">
                  {userData.fullName}
                </h1>
                <p className="text-zinc-400 text-sm font-medium">Verified Customer</p>
              </div>
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-8">
              <div>
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-2">
                  Email Address
                </p>
                <p className="font-bold text-zinc-900">{userData.email}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-2">
                  Phone Number
                </p>
                <p className="font-bold text-zinc-900">{userData.phone || 'Not updated'}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-2">
                  Primary Address
                </p>
                <p className="font-bold text-zinc-900 max-w-sm">
                  {userData.address || 'No address provided'}
                </p>
              </div>
            </div>
          </div>

          {/* Security Card */}
          <div className="bg-primary-container rounded-[40px] p-10 text-white shadow-xl flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8">
                <span className="material-symbols-outlined text-white">verified_user</span>
              </div>
              <h2 className="text-2xl font-black font-space-grotesk mb-4 uppercase italic">
                Account Security
              </h2>
              <p className="text-white/70 text-sm leading-relaxed mb-10">
                Keep your credentials updated to ensure secure transactions and early access drops.
              </p>
            </div>
            <div className="space-y-4">
              {/* ← Nút này giờ mở ChangePasswordModal */}
              <button
                onClick={() => setShowChangePasswordModal(true)}
                className="w-full bg-white text-primary-container font-black py-4 rounded-2xl text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-zinc-100 transition-all"
              >
                Change Password
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </button>
              <button
                onClick={() => setShowLogoutAllModal(true)}
                className="w-full bg-white/10 border border-white/10 backdrop-blur-md text-white font-black py-4 rounded-2xl text-xs uppercase tracking-widest hover:bg-white/20 transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">devices_off</span>
                Logout All Devices
              </button>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <section className="bg-white rounded-[40px] p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-2xl font-bold text-zinc-900 uppercase tracking-tight">
              Recent Orders
            </h2>
            <Link
              to="/orders"
              className="text-primary-container font-black text-xs uppercase tracking-widest hover:text-zinc-900 transition-colors"
            >
              View All Orders
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-zinc-100">
                  <th className="pb-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Product</th>
                  <th className="pb-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Order ID</th>
                  <th className="pb-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center">Date</th>
                  <th className="pb-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center">Total</th>
                  <th className="pb-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order, idx) => (
                  <tr key={idx} className="border-b border-zinc-50 last:border-0 group cursor-pointer">
                    <td className="py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-zinc-50 rounded-xl p-1 flex items-center justify-center">
                          <img src={order.image} alt={order.product} className="w-full h-full object-contain" />
                        </div>
                        <span className="font-bold text-sm text-zinc-900 group-hover:text-primary-container transition-colors">
                          {order.product}
                        </span>
                      </div>
                    </td>
                    <td className="py-6">
                      <span className="text-sm font-bold text-zinc-400">{order.id}</span>
                    </td>
                    <td className="py-6 text-center">
                      <span className="text-sm font-bold text-zinc-900">{order.date}</span>
                    </td>
                    <td className="py-6 text-center">
                      <span className="text-sm font-black text-zinc-900 italic">
                        ${order.total.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-6 text-right">
                      <span
                        className={`inline-block px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest ${
                          order.status === 'DELIVERED'
                            ? 'bg-green-100 text-green-600'
                            : 'bg-blue-100 text-blue-600'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ProfilePage;