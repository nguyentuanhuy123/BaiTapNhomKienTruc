import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const ForgotPasswordPage = () => {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: Reset
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [showPassword, setShowPassword] = useState(false);
  const inputRefs = useRef([]);
  const navigate = useNavigate();

  const handleNextStep = (e) => {
    e.preventDefault();
    setStep(step + 1);
  };

  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return false;
    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);
    if (element.value !== '' && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === 'Backspace' && index > 0 && otp[index] === '') {
      inputRefs.current[index - 1].focus();
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
            Step {step} of 3 • {step === 1 ? 'Identification' : step === 2 ? 'Verification' : 'Reset'}
          </div>
        </div>
      </div>

      {/* Right Side - Step Forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-12">
        <div className="w-full max-w-md">
          {/* Step 1: Enter Email */}
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
                <p className="text-zinc-500">No worries! Enter the email address associated with your account and we'll send an OTP to reset your password.</p>
              </div>

              <form className="space-y-8" onSubmit={handleNextStep}>
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
                <button className="w-full bg-primary-container text-white font-bold py-5 rounded-2xl shadow-[0_15px_30px_-5px_rgba(0,82,255,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                  Send OTP
                  <span className="material-symbols-outlined">send</span>
                </button>
              </form>
            </div>
          )}

          {/* Step 2: Verify OTP */}
          {step === 2 && (
            <div className="animate-fade-in">
              <div className="mb-10 text-center lg:text-left">
                <button 
                  onClick={() => setStep(1)}
                  className="flex items-center gap-2 text-zinc-400 hover:text-zinc-900 transition-colors mb-6 group"
                >
                  <span className="material-symbols-outlined text-sm transition-transform group-hover:-translate-x-1">arrow_back</span>
                  <span className="text-sm font-bold uppercase tracking-widest">Change Email</span>
                </button>
                <h1 className="text-[32px] font-bold text-zinc-900 mb-2">Verify OTP</h1>
                <p className="text-zinc-500">
                  We've sent a 6-digit code to <span className="text-zinc-900 font-bold">{email}</span>. 
                  Enter the code to continue.
                </p>
              </div>

              <form className="space-y-10" onSubmit={handleNextStep}>
                <div className="flex justify-between gap-2 md:gap-4">
                  {otp.map((data, index) => (
                    <input
                      key={index}
                      type="text"
                      maxLength="1"
                      ref={(el) => (inputRefs.current[index] = el)}
                      value={data}
                      onChange={(e) => handleOtpChange(e.target, index)}
                      onKeyDown={(e) => handleOtpKeyDown(e, index)}
                      className="w-full aspect-square text-center text-2xl font-bold bg-zinc-50 border border-zinc-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary-container focus:bg-white transition-all"
                    />
                  ))}
                </div>
                <button className="w-full bg-primary-container text-white font-bold py-5 rounded-2xl shadow-[0_15px_30px_-5px_rgba(0,82,255,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all">
                  Verify & Continue
                </button>
              </form>
            </div>
          )}

          {/* Step 3: Reset Password */}
          {step === 3 && (
            <div className="animate-fade-in">
              <div className="mb-10 text-center lg:text-left">
                <h1 className="text-[32px] font-bold text-zinc-900 mb-2">Create New Password</h1>
                <p className="text-zinc-500">Set a strong password to protect your Aero-Tech account.</p>
              </div>

              <form className="space-y-6" onSubmit={() => navigate('/login')}>
                <div className="relative">
                  <label className="block text-label-md font-bold text-zinc-900 mb-2">New Password</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"}
                      required
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
                  <label className="block text-label-md font-bold text-zinc-900 mb-2">Confirm New Password</label>
                  <input 
                    type="password"
                    required
                    placeholder="••••••••"
                    className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-primary-container transition-all"
                  />
                </div>

                <button className="w-full bg-primary-container text-white font-bold py-5 rounded-2xl shadow-[0_15px_30px_-5px_rgba(0,82,255,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all">
                  Reset Password
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
