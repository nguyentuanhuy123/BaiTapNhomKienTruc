import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authApi from '../api/authApi';
import { useAlert } from '../contexts/AlertContext';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { showAlert } = useAlert();

  // State quản lý bước hiện tại (1: Login, 2: Xác thực OTP)
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // State quản lý dữ liệu form đăng nhập
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  // State và Ref cho OTP
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef([]);

  // Hàm cập nhật state khi người dùng gõ email/mật khẩu
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePaste = (e) => {
    const data = e.clipboardData.getData('text').trim();
    // Kiểm tra nếu dữ liệu dán vào là số
    if (!/^\d+$/.test(data)) return;

    const pasteData = data.split('').slice(0, 6); // Lấy tối đa 6 ký tự
    const newOtp = [...otp];
    
    pasteData.forEach((char, index) => {
      newOtp[index] = char;
    });
    
    setOtp(newOtp);

    // Focus vào ô cuối cùng sau khi paste hoặc ô tiếp theo còn trống
    const nextIndex = pasteData.length >= 6 ? 5 : pasteData.length;
    inputRefs.current[nextIndex].focus();
    
    e.preventDefault();
  };
  

  // Hàm xử lý thay đổi trên ô nhập OTP
  const handleOtpChange = (element, index) => {
    const value = element.value;
    if (isNaN(value)) return;

    const newOtp = [...otp];
    // Chỉ lấy ký tự cuối cùng nếu người dùng gõ đè
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Tự động focus sang ô tiếp theo
    if (value !== '' && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  // Hàm xử lý xóa trên ô nhập OTP
  const handleOtpKeyDown = (e, index) => {
    if (e.key === 'Backspace' && index > 0 && otp[index] === '') {
      inputRefs.current[index - 1].focus();
    }
  };

  // Hàm xử lý submit form Đăng nhập (Bước 1)
  const handleLoginSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      showAlert("Vui lòng nhập đầy đủ email và mật khẩu", "error");
      return;
    }

    setLoading(true);
    try {
      await authApi.login({
        email: formData.email,
        password: formData.password
      });

      showAlert("Vui lòng kiểm tra email để lấy mã OTP!", "success");
      setStep(2); // Chuyển sang bước nhập OTP

    } catch (err) {
      const message = err.response?.data?.message || 'Đăng nhập thất bại, vui lòng kiểm tra lại.';
      showAlert(message, "error");
    } finally {
      setLoading(false);
    }
  };

  // Hàm xử lý submit form OTP (Bước 2)
  const handleVerifyOtpSubmit = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');

    if (otpString.length < 6) {
      showAlert("Vui lòng nhập đủ 6 số OTP", "error");
      return;
    }

    setLoading(true);
    try {
      // API verifyOtp trả về { accessToken, refreshToken, role, sessionId }
      const response = await authApi.verifyOtp({
        email: formData.email,
        otp: otpString
      });

      
      
      // LƯU THÔNG TIN SESSION VÀ TOKEN VÀO LOCAL STORAGE
      login(
        response.accessToken, 
        response.refreshToken, 
        formData.email, 
        response.role, 
        response.sessionId
      );
      showAlert("Đăng nhập thành công!", "success");
      navigate('/');

    } catch (err) {
      const message = err.response?.data?.message || 'Xác thực OTP thất bại. Vui lòng thử lại.';
      showAlert(message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white font-body-md">
      {/* Left Side - Image and Branding */}
      <div className="hidden lg:flex w-1/2 bg-[#F3F4F6] flex-col p-12 relative overflow-hidden">
        <div className="relative z-10 flex flex-col h-full justify-between">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <span className="text-2xl font-black italic text-zinc-900 tracking-widest font-space-grotesk">AERO-TECH</span>
              <span className="bg-primary-container text-white text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                Next Gen Performance
              </span>
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-center items-center relative z-10">
            <div className="relative w-full max-w-lg aspect-square mb-12">
              <div className="absolute inset-0 bg-primary-container/5 rounded-full blur-[100px]"></div>
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDlNG2P_20pGAAH4lD1LeB5XUPjnnrFc1Iqelb0yK_m5pU8LBE-r1o2Qc0s98A3ibTFLgTBWkOL_Of5_oOH0uULbeky0x39_KUNX_WWNODTJMDKHAAG_xht_x1U0gWH71RRXbW_ZtO1ozzj1yI-3cDWy7ha4kOLfSxqzcFYN7BgdKbZ3lfnDHt2k0E7f0EimKNABOUGiiHM7MyaiARflxSGkXj5a0rOM8LI-ylmoHgcPxKHEJvRV5XyWWxtRcZzNNk7Ff5qopsRjeM" 
                alt="Performance Shoe"
                className="w-full h-full object-contain relative z-10 drop-shadow-[0_20px_50px_rgba(0,82,255,0.2)]"
              />
            </div>
            
            <div className="text-center max-w-md">
              <h2 className="text-4xl font-space-grotesk font-black text-zinc-900 mb-4 leading-tight">
                Engineered for <span className="text-primary-container">Speed.</span>
              </h2>
              <p className="text-zinc-500 text-body-lg">
                Experience the revolutionary cloud-foam technology that propels your every step forward.
              </p>
            </div>
          </div>

          {step === 2 && (
            <div className="text-zinc-400 text-sm mt-8">
              Step 2 of 2 • Verification
            </div>
          )}
        </div>

        {/* Decorative background elements */}
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary-container/10 rounded-full blur-[120px]"></div>
      </div>

      {/* Right Side - Login Forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-12">
        <div className="w-full max-w-md">
          
          {/* STEP 1: Đăng nhập bằng Email và Password */}
          {step === 1 && (
            <div className="animate-fade-in">
              <div className="mb-10 text-center lg:text-left">
                <h1 className="text-[32px] font-bold text-zinc-900 mb-2">Welcome back</h1>
                <p className="text-zinc-500">Please enter your details to access your account.</p>
              </div>

              <form className="space-y-6" onSubmit={handleLoginSubmit}>
                <div>
                  <label className="block text-label-md font-bold text-zinc-900 mb-2">Email Address</label>
                  <input 
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="name@company.com"
                    className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-primary-container transition-all"
                  />
                </div>

                <div className="relative">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-label-md font-bold text-zinc-900">Password</label>
                    <Link to="/forgot-password" className="text-primary-container font-bold text-sm hover:underline">Forgot Password?</Link>
                  </div>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      placeholder="••••••••"
                      className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-primary-container transition-all pr-14"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-900"
                    >
                      <span className="material-symbols-outlined">
                        {showPassword ? 'visibility' : 'visibility_off'}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    id="remember"
                    className="w-5 h-5 rounded border-zinc-200 text-primary-container focus:ring-primary-container cursor-pointer"
                  />
                  <label htmlFor="remember" className="text-zinc-500 text-sm cursor-pointer select-none">
                    Remember me for 30 days
                  </label>
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className={`w-full bg-primary-container text-white font-bold py-5 rounded-2xl shadow-[0_15px_30px_-5px_rgba(0,82,255,0.3)] transition-all flex items-center justify-center gap-2 group ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-[0.98]'}`}
                >
                  {loading ? 'Processing...' : 'Sign In'}
                </button>
              </form>

              <div className="my-10 flex items-center gap-4 text-zinc-300">
                <div className="flex-1 h-[1px] bg-zinc-100"></div>
                <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">Or continue with</span>
                <div className="flex-1 h-[1px] bg-zinc-100"></div>
              </div>

              <div className="flex gap-4 mb-10">
                <button className="flex-1 flex items-center justify-center gap-3 py-4 border border-zinc-100 rounded-2xl hover:bg-zinc-50 transition-all font-bold text-zinc-900">
                  <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" alt="Google" className="w-5 h-5" />
                  Google
                </button>
              </div>

              <div className="text-center">
                <p className="text-zinc-500">
                  Don't have an account? <Link to="/register" className="text-primary-container font-bold hover:underline">Create an account</Link>
                </p>
              </div>
            </div>
          )}

          {/* STEP 2: Xác thực OTP */}
          {step === 2 && (
            <div className="animate-fade-in">
              <div className="mb-10 text-center lg:text-left">
                <button 
                  onClick={() => setStep(1)}
                  className="flex items-center gap-2 text-zinc-400 hover:text-zinc-900 transition-colors mb-6 group"
                >
                  <span className="material-symbols-outlined text-sm transition-transform group-hover:-translate-x-1">arrow_back</span>
                  <span className="text-sm font-bold uppercase tracking-widest">Back to login</span>
                </button>
                <h1 className="text-[32px] font-bold text-zinc-900 mb-2">Verify OTP</h1>
                <p className="text-zinc-500">
                  We've sent a 6-digit code to <span className="text-zinc-900 font-bold">{formData.email}</span>. 
                  Enter the code to complete sign in.
                </p>
              </div>

              <form className="space-y-10" onSubmit={handleVerifyOtpSubmit}>
                <div className="flex justify-between gap-2 md:gap-4">
                  {otp.map((data, index) => (
                    <input
                      key={index}
                      type="text"
                      inputMode="numeric" // Hiển thị bàn phím số trên mobile
                      maxLength="1"
                      ref={(el) => (inputRefs.current[index] = el)}
                      value={data}
                      onPaste={handlePaste} // Thêm sự kiện paste ở đây
                      onChange={(e) => handleOtpChange(e.target, index)}
                      onKeyDown={(e) => handleOtpKeyDown(e, index)}
                      className="w-full aspect-square text-center text-2xl font-bold bg-zinc-50 border border-zinc-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary-container focus:bg-white transition-all"
                      />
                  ))}
                </div>
                <button 
                  type="submit"
                  disabled={loading}
                  className={`w-full bg-primary-container text-white font-bold py-5 rounded-2xl shadow-[0_15px_30px_-5px_rgba(0,82,255,0.3)] transition-all flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-[0.98]'}`}
                >
                  {loading ? 'Verifying...' : 'Verify & Sign In'}
                </button>
              </form>
            </div>
          )}

          <div className="mt-20 text-center">
            <p className="text-zinc-400 text-xs">
              © 2024 Aero-Tech Performance. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;