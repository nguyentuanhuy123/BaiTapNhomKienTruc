import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import authApi from '../api/authApi'; 
import { useAlert } from '../contexts/AlertContext'; // Thay đổi đường dẫn import này cho đúng với file của bạn

const ForgotPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token'); 

  const [step, setStep] = useState(token ? 3 : 1); 
  const [email, setEmail] = useState('');
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  
  // Khởi tạo hook useAlert
  const { showAlert } = useAlert();

  const handleSendLink = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await authApi.forgotPassword(email);
      setStep(2); 
      showAlert('Đã gửi liên kết khôi phục. Vui lòng kiểm tra email!', 'success');
    } catch (error) {
      showAlert(error.response?.data?.message || 'Có lỗi xảy ra khi gửi email. Vui lòng thử lại.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      showAlert('Mật khẩu xác nhận không khớp!', 'error');
      return;
    }

    setIsLoading(true);
    try {
      await authApi.resetPassword({ token, newPassword });
      showAlert('Đặt lại mật khẩu thành công! Vui lòng đăng nhập.', 'success');
      navigate('/login');
    } catch (error) {
      showAlert(error.response?.data?.message || 'Token không hợp lệ hoặc đã hết hạn.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white font-body-md">
      {/* Left Side - Visual Content */}
      <div className="hidden lg:flex w-1/2 bg-[#F3F4F6] flex-col p-12 relative overflow-hidden">
        <div className="relative z-10 flex flex-col h-full justify-between">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <span className="text-2xl font-black italic text-zinc-900 tracking-widest font-space-grotesk">AERO-TECH</span>
              <span className="bg-primary-container text-white text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                Account Recovery
              </span>
            </div>
            <h2 className="text-4xl font-space-grotesk font-black text-zinc-900 mb-4 leading-tight">
              Regain your <span className="text-primary-container">Access.</span>
            </h2>
            <p className="text-zinc-500 text-body-lg max-w-sm">
              Don't worry, it happens to the best of us. We'll help you get back to your peak performance in no time.
            </p>
          </div>

          <div className="relative w-full max-w-md mx-auto aspect-square flex items-center justify-center">
            <div className="absolute inset-0 bg-primary-container/10 rounded-full blur-[100px] animate-pulse"></div>
            <span className="material-symbols-outlined text-[180px] text-primary-container opacity-20 transform -rotate-12">
              lock_reset
            </span>
          </div>

          <div className="text-zinc-400 text-sm">
            Step {step} of 3 • {step === 1 ? 'Identification' : step === 2 ? 'Check Email' : 'Reset'}
          </div>
        </div>
      </div>

      {/* Right Side - Step Forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-12">
        <div className="w-full max-w-md">

          {/* Step 1: Nhập Email để gửi Link */}
          {step === 1 && (
            <div className="animate-fade-in">
              <div className="mb-10 text-center lg:text-left">
                <button 
                  onClick={() => navigate('/login')}
                  className="flex items-center gap-2 text-zinc-400 hover:text-zinc-900 transition-colors mb-6 group"
                >
                  <span className="material-symbols-outlined text-sm transition-transform group-hover:-translate-x-1">arrow_back</span>
                  <span className="text-sm font-bold uppercase tracking-widest">Back to login</span>
                </button>
                <h1 className="text-[32px] font-bold text-zinc-900 mb-2">Forgot Password?</h1>
                <p className="text-zinc-500">Nhập email liên kết với tài khoản của bạn, chúng tôi sẽ gửi một liên kết để đặt lại mật khẩu.</p>
              </div>

              <form className="space-y-8" onSubmit={handleSendLink}>
                <div>
                  <label className="block text-label-md font-bold text-zinc-900 mb-2">Email Address</label>
                  <input 
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-primary-container transition-all"
                  />
                </div>
                <button 
                  disabled={isLoading}
                  className={`w-full bg-primary-container text-white font-bold py-5 rounded-2xl shadow-[0_15px_30px_-5px_rgba(0,82,255,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isLoading ? 'Đang gửi...' : 'Gửi liên kết khôi phục'}
                  {!isLoading && <span className="material-symbols-outlined">send</span>}
                </button>
              </form>
            </div>
          )}

          {/* Step 2: Thông báo check Email */}
          {step === 2 && (
            <div className="animate-fade-in">
              <div className="mb-10 text-center lg:text-left">
                <button 
                  onClick={() => setStep(1)}
                  className="flex items-center gap-2 text-zinc-400 hover:text-zinc-900 transition-colors mb-6 group"
                >
                  <span className="material-symbols-outlined text-sm transition-transform group-hover:-translate-x-1">arrow_back</span>
                  <span className="text-sm font-bold uppercase tracking-widest">Thay đổi Email</span>
                </button>
                <h1 className="text-[32px] font-bold text-zinc-900 mb-2">Kiểm tra Email của bạn</h1>
                <p className="text-zinc-500">
                  Chúng tôi đã gửi một liên kết khôi phục đến <span className="text-zinc-900 font-bold">{email}</span>. 
                  Vui lòng kiểm tra hộp thư đến (và mục Spam) để tiếp tục.
                </p>
              </div>

              <button 
                onClick={() => navigate('/login')}
                className="w-full bg-zinc-100 text-zinc-900 font-bold py-5 rounded-2xl hover:bg-zinc-200 transition-all"
              >
                Trở về trang Đăng nhập
              </button>
            </div>
          )}

          {/* Step 3: Đặt lại Mật khẩu */}
          {step === 3 && (
            <div className="animate-fade-in">
              <div className="mb-10 text-center lg:text-left">
                <h1 className="text-[32px] font-bold text-zinc-900 mb-2">Tạo mật khẩu mới</h1>
                <p className="text-zinc-500">Tạo một mật khẩu mạnh để bảo vệ tài khoản Aero-Tech của bạn.</p>
              </div>

              <form className="space-y-6" onSubmit={handleResetPassword}>
                <div className="relative">
                  <label className="block text-label-md font-bold text-zinc-900 mb-2">Mật khẩu mới</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-primary-container transition-all"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-900"
                    >
                      <span className="material-symbols-outlined">{showPassword ? 'visibility' : 'visibility_off'}</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-label-md font-bold text-zinc-900 mb-2">Xác nhận mật khẩu mới</label>
                  <input 
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-primary-container transition-all"
                  />
                </div>

                <button 
                  disabled={isLoading}
                  className={`w-full bg-primary-container text-white font-bold py-5 rounded-2xl shadow-[0_15px_30px_-5px_rgba(0,82,255,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isLoading ? 'Đang xử lý...' : 'Xác nhận đổi mật khẩu'}
                </button>
              </form>
            </div>
          )}

          <div className="mt-20 text-center">
            <p className="text-zinc-400 text-xs uppercase tracking-widest font-bold">
              Secure Account Recovery System
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;