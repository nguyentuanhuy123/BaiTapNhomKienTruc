import React from 'react';
import { Link } from 'react-router-dom';

const RegisterPage = () => {
  return (
    <div className="flex min-h-screen bg-white font-body-md">
      {/* Left Side - Inspiration & Stats */}
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
            
            {/* Slider Indicators */}
            <div className="flex gap-3">
              {[...Array(9)].map((_, i) => (
                <div 
                  key={i} 
                  className={`h-2 rounded-full transition-all duration-300 ${i === 0 ? 'w-12 bg-primary-container' : 'w-2 bg-white/30'}`}
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-12 overflow-y-auto">
        <div className="w-full max-w-md my-auto">
          <div className="mb-10 text-center lg:text-left">
            <h1 className="text-[32px] font-bold text-zinc-900 mb-2">Get Started</h1>
            <p className="text-zinc-500">Create your account to unlock personalized performance tracking and early access.</p>
          </div>

          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="block text-label-md font-bold text-zinc-900 mb-2">Full Name</label>
              <input 
                type="text"
                placeholder="Enter your full name"
                className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-primary-container transition-all"
              />
            </div>

            <div>
              <label className="block text-label-md font-bold text-zinc-900 mb-2">Email Address</label>
              <input 
                type="email"
                placeholder="runner@aero-tech.com"
                className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-primary-container transition-all"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-label-md font-bold text-zinc-900 mb-2">Password</label>
                <input 
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-primary-container transition-all"
                />
              </div>
              <div>
                <label className="block text-label-md font-bold text-zinc-900 mb-2">Confirm</label>
                <input 
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-primary-container transition-all"
                />
              </div>
            </div>

            <div className="flex items-start gap-3">
              <input 
                type="checkbox" 
                id="terms"
                className="mt-1 w-5 h-5 rounded border-zinc-200 text-primary-container focus:ring-primary-container"
              />
              <label htmlFor="terms" className="text-zinc-500 text-sm cursor-pointer select-none leading-relaxed">
                I agree to the <Link to="#" className="text-primary-container font-bold hover:underline">Terms and Conditions</Link> and <Link to="#" className="text-primary-container font-bold hover:underline">Privacy Policy</Link>.
              </label>
            </div>

            <button className="w-full bg-primary-container text-white font-bold py-5 rounded-2xl shadow-[0_15px_30px_-5px_rgba(0,82,255,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group">
              Create Account
              <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">arrow_forward</span>
            </button>
          </form>

          <div className="my-8 text-center">
            <p className="text-zinc-500">
              Already have an account? <Link to="/login" className="text-primary-container font-bold hover:underline">Sign In</Link>
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
