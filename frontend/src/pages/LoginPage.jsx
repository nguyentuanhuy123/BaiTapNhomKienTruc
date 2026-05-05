import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex min-h-screen bg-white font-body-md">
      {/* Left Side - Image and Branding */}
      <div className="hidden lg:flex w-1/2 bg-[#F3F4F6] flex-col p-12 relative overflow-hidden">
        <div className="relative z-10">
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

        {/* Decorative background elements */}
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary-container/10 rounded-full blur-[120px]"></div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-12">
        <div className="w-full max-w-md">
          <div className="mb-10 text-center lg:text-left">
            <h1 className="text-[32px] font-bold text-zinc-900 mb-2">Welcome back</h1>
            <p className="text-zinc-500">Please enter your details to access your account.</p>
          </div>

          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="block text-label-md font-bold text-zinc-900 mb-2">Email Address</label>
              <input 
                type="email"
                placeholder="name@company.com"
                className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-primary-container transition-all"
              />
            </div>

            <div className="relative">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-label-md font-bold text-zinc-900">Password</label>
                <Link to="#" className="text-primary-container font-bold text-sm hover:underline">Forgot Password?</Link>
              </div>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"}
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
                className="w-5 h-5 rounded border-zinc-200 text-primary-container focus:ring-primary-container"
              />
              <label htmlFor="remember" className="text-zinc-500 text-sm cursor-pointer select-none">
                Remember me for 30 days
              </label>
            </div>

            <button className="w-full bg-primary-container text-white font-bold py-5 rounded-2xl shadow-[0_15px_30px_-5px_rgba(0,82,255,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all">
              Sign In
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
