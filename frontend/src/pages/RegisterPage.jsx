import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import authApi from '../api/authApi';
import { useAlert } from '../contexts/AlertContext';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { showAlert } = useAlert();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    street: '',
    ward: '',
    district: '',
    city: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);

  const validateField = (name, value) => {
    let error = '';
    switch (name) {
      case 'fullName':
        if (value.trim().length < 2) error = 'Tên phải có ít nhất 2 ký tự';
        break;
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) error = 'Email không đúng định dạng';
        break;
      case 'password':
        if (value.length < 6) error = 'Mật khẩu phải từ 6 ký tự trở lên';
        break;
      case 'confirmPassword':
        if (value !== formData.password) error = 'Mật khẩu xác nhận không khớp';
        break;
      case 'street':
        if (value.trim().length < 5) error = 'Vui lòng nhập số nhà, tên đường (ít nhất 5 ký tự)';
        break;
      case 'ward':
        if (value.trim().length < 2) error = 'Vui lòng nhập phường/xã';
        break;
      case 'district':
        if (value.trim().length < 2) error = 'Vui lòng nhập quận/huyện';
        break;
      case 'city':
        if (value.trim().length < 2) error = 'Vui lòng nhập tỉnh/thành phố';
        break;
      default:
        break;
    }
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });

    if (!termsAccepted) {
      setServerError('Bạn phải đồng ý với các điều khoản dịch vụ');
      return;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const address = JSON.stringify({
        street: formData.street,
        ward: formData.ward,
        district: formData.district,
        city: formData.city,
      });
      await authApi.register({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        address,
        // phone không gửi lúc đăng ký — người dùng xác minh sau trong Profile
      });

      showAlert('Đăng ký thành công! Vui lòng đăng nhập.', 'success');
      setTimeout(() => navigate('/login'), 100);
    } catch (err) {
      const message = err.response?.data?.message || 'Đăng ký thất bại, vui lòng thử lại.';
      showAlert(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white font-body-md">
      {/* Left Side */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden group">
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuC0RVALbOkLApO_oXHaOyd3IWWZ8Qvks5oe-kHfsvF7mW75C2xuAjpcGIUGPI-gSj9wL5DFdjTwLg_yykk_NcgMz11D88DnV5QQxcfFf4FoHCVaz7jq_AAA-M-5q0HAfN4gImuC1pbHX3O-2ndzjL2XmHZyS22WnMsUdZUWrRqOnwHNhjd8mmVUM0GPKSzSzLW_npyBKLUzzaJQEANEWMxYnif5AKpViFptzlZJo8Kuyuv24ENPSUdQmcRrEaPBZPQ2io5_yTbQ4b8"
          alt="Runner in motion"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-[10s] group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/20 to-transparent"></div>

        <div className="relative z-10 p-12 flex flex-col h-full">
          <div className="flex items-center gap-3 mb-6">
            <span className="material-symbols-outlined text-white text-3xl">speed</span>
            <span className="text-2xl font-black italic text-white tracking-widest font-space-grotesk uppercase">Aero-Tech</span>
          </div>
          <p className="text-white/80 font-bold mb-12 max-w-sm">Redefining the rhythm of your run.</p>

          <div className="mt-auto">
            <p className="text-white/90 text-sm font-medium mb-8 max-w-md">
              Experience the next generation of kinetic performance. Join the community pushing the boundaries of comfort and speed.
            </p>
            <div className="grid grid-cols-2 gap-12 mb-12">
              <div>
                <p className="text-white/50 text-[10px] font-black uppercase tracking-widest mb-1">Lightweight</p>
                <p className="text-white text-2xl font-space-grotesk font-black">180g</p>
              </div>
              <div>
                <p className="text-white/50 text-[10px] font-black uppercase tracking-widest mb-1">Energy Return</p>
                <p className="text-white text-2xl font-space-grotesk font-black">94%</p>
              </div>
            </div>
            <div className="flex gap-3">
              {[...Array(9)].map((_, i) => (
                <div
                  key={i}
                  className={`h-2 rounded-full transition-all duration-300 ${i === 0 ? 'w-12 bg-primary-container' : 'w-2 bg-white/30'}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Side — Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-12 overflow-y-auto">
        <div className="w-full max-w-md my-auto">
          <div className="mb-10 text-center lg:text-left">
            <h1 className="text-[32px] font-bold text-zinc-900 mb-2">Get Started</h1>
            <p className="text-zinc-500">
              Create your account to unlock personalized performance tracking and early access.
            </p>
          </div>

          {serverError && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm">
              {serverError}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Full Name */}
            <div>
              <label className="block text-label-md font-bold text-zinc-900 mb-2">Full Name</label>
              <input
                name="fullName"
                type="text"
                required
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter your full name"
                className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-primary-container transition-all"
              />
              {errors.fullName && <p className="text-red-500 text-sm mt-1 ml-2">{errors.fullName}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-label-md font-bold text-zinc-900 mb-2">Email Address</label>
              <input
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="runner@aero-tech.com"
                className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-primary-container transition-all"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1 ml-2">{errors.email}</p>}
            </div>

            {/* Address — 4 ô cấu trúc */}
            <div className="space-y-4">
              <label className="block text-label-md font-bold text-zinc-900">Địa chỉ</label>

              {/* Street */}
              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1.5">Số nhà, tên đường</label>
                <input
                  name="street"
                  type="text"
                  required
                  value={formData.street}
                  onChange={handleChange}
                  placeholder="VD: 123 Nguyễn Huệ"
                  className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-primary-container transition-all"
                />
                {errors.street && <p className="text-red-500 text-sm mt-1 ml-2">{errors.street}</p>}
              </div>

              {/* Ward + District in 2 cols */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1.5">Phường / Xã</label>
                  <input
                    name="ward"
                    type="text"
                    required
                    value={formData.ward}
                    onChange={handleChange}
                    placeholder="VD: Phường Bến Nghé"
                    className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-primary-container transition-all"
                  />
                  {errors.ward && <p className="text-red-500 text-sm mt-1 ml-2">{errors.ward}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1.5">Quận / Huyện</label>
                  <input
                    name="district"
                    type="text"
                    required
                    value={formData.district}
                    onChange={handleChange}
                    placeholder="VD: Quận 1"
                    className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-primary-container transition-all"
                  />
                  {errors.district && <p className="text-red-500 text-sm mt-1 ml-2">{errors.district}</p>}
                </div>
              </div>

              {/* City */}
              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1.5">Tỉnh / Thành phố</label>
                <input
                  name="city"
                  type="text"
                  required
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="VD: TP. Hồ Chí Minh"
                  className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-primary-container transition-all"
                />
                {errors.city && <p className="text-red-500 text-sm mt-1 ml-2">{errors.city}</p>}
              </div>
            </div>

            {/* Password + Confirm */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-label-md font-bold text-zinc-900 mb-2">Password</label>
                <input
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-primary-container transition-all"
                />
                {errors.password && <p className="text-red-500 text-sm mt-1 ml-2">{errors.password}</p>}
              </div>
              <div>
                <label className="block text-label-md font-bold text-zinc-900 mb-2">Confirm</label>
                <input
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-primary-container transition-all"
                />
                {errors.confirmPassword && <p className="text-red-500 text-sm mt-1 ml-2">{errors.confirmPassword}</p>}
              </div>
            </div>

            {/* Phone notice */}
            <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-2xl px-5 py-3">
              <span className="material-symbols-outlined text-blue-400 text-lg shrink-0">info</span>
              <p className="text-xs text-blue-700 font-medium leading-relaxed">
                Số điện thoại sẽ được thêm và xác minh qua OTP trong trang <span className="font-bold">Profile</span> sau khi đăng nhập.
              </p>
            </div>

            {/* Terms */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="terms"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-zinc-200 text-primary-container focus:ring-primary-container cursor-pointer"
              />
              <label htmlFor="terms" className="text-zinc-500 text-sm cursor-pointer select-none leading-relaxed">
                I agree to the{' '}
                <Link to="#" className="text-primary-container font-bold hover:underline">Terms and Conditions</Link>
                {' '}and{' '}
                <Link to="#" className="text-primary-container font-bold hover:underline">Privacy Policy</Link>.
              </label>
            </div>

            <button
              disabled={loading}
              className={`w-full bg-primary-container text-white font-bold py-5 rounded-2xl shadow-[0_15px_30px_-5px_rgba(0,82,255,0.3)] transition-all flex items-center justify-center gap-2 group ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-[0.98]'}`}
            >
              {loading ? 'Processing...' : 'Create Account'}
              {!loading && (
                <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">arrow_forward</span>
              )}
            </button>
          </form>

          <div className="my-8 text-center">
            <p className="text-zinc-500">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-container font-bold hover:underline">Sign In</Link>
            </p>
          </div>

          <div className="flex items-center gap-4 text-zinc-300 mb-8">
            <div className="flex-1 h-[1px] bg-zinc-100"></div>
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">Or register with</span>
            <div className="flex-1 h-[1px] bg-zinc-100"></div>
          </div>

          <div className="flex gap-4 mb-8">
            <button className="flex-1 flex items-center justify-center gap-3 py-4 border border-zinc-100 rounded-2xl hover:bg-zinc-50 transition-all font-bold text-zinc-900">
              <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" alt="Google" className="w-5 h-5" />
              Google
            </button>
          </div>

          <div className="text-center">
            <p className="text-zinc-400 text-xs italic">
              Experience the revolutionary cloud-foam technology.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;