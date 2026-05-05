import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const VerifyEmailPage = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(59);
  const inputRefs = useRef([]);
  const navigate = useNavigate();

  // Timer logic for resend code
  useEffect(() => {
    const interval = setInterval(() => {
      if (timer > 0) setTimer(timer - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return false;

    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

    // Focus next input
    if (element.value !== '' && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && index > 0 && otp[index] === '') {
      inputRefs.current[index - 1].focus();
    }
  };

  return (
    <div className="flex min-h-screen bg-white font-body-md">
      {/* Left Side - Visual Branding */}
      <div className="hidden lg:flex w-1/2 bg-[#F3F4F6] flex-col p-12 relative overflow-hidden">
        <div className="relative z-10 flex flex-col h-full justify-between">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <span className="text-2xl font-black italic text-zinc-900 tracking-widest font-space-grotesk">AERO-TECH</span>
              <span className="bg-primary-container text-white text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                Security Layer
              </span>
            </div>
            <h2 className="text-4xl font-space-grotesk font-black text-zinc-900 mb-4 leading-tight max-w-sm">
              Protecting your <span className="text-primary-container">Performance.</span>
            </h2>
            <p className="text-zinc-500 text-body-lg max-w-sm">
              We take security seriously to ensure your data and achievements remain only yours.
            </p>
          </div>

          <div className="relative w-full max-w-md aspect-square mx-auto">
            <div className="absolute inset-0 bg-primary-container/10 rounded-full blur-[80px] animate-pulse"></div>
            <span className="material-symbols-outlined text-[200px] text-primary-container absolute inset-0 flex items-center justify-center opacity-20">
              verified_user
            </span>
          </div>

          <div className="text-zinc-400 text-sm italic">
            "Your privacy is the core of our technology."
          </div>
        </div>
      </div>

      {/* Right Side - OTP Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-12">
        <div className="w-full max-w-md">
          <div className="mb-10 text-center lg:text-left">
            <button 
              onClick={() => navigate('/register')}
              className="flex items-center gap-2 text-zinc-400 hover:text-zinc-900 transition-colors mb-6 group"
            >
              <span className="material-symbols-outlined text-sm transition-transform group-hover:-translate-x-1">arrow_back</span>
              <span className="text-sm font-bold uppercase tracking-widest">Back to register</span>
            </button>
            <h1 className="text-[32px] font-bold text-zinc-900 mb-2">Verify your email</h1>
            <p className="text-zinc-500">
              We've sent a 6-digit verification code to <span className="text-zinc-900 font-bold">runner@aero-tech.com</span>. 
              Please enter the code below.
            </p>
          </div>

          <form className="space-y-10" onSubmit={(e) => e.preventDefault()}>
            <div className="flex justify-between gap-2 md:gap-4">
              {otp.map((data, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength="1"
                  ref={(el) => (inputRefs.current[index] = el)}
                  value={data}
                  onChange={(e) => handleChange(e.target, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  className="w-full aspect-square text-center text-2xl font-bold bg-zinc-50 border border-zinc-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary-container focus:bg-white transition-all"
                />
              ))}
            </div>

            <div className="space-y-6">
              <button className="w-full bg-primary-container text-white font-bold py-5 rounded-2xl shadow-[0_15px_30px_-5px_rgba(0,82,255,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all">
                Verify Account
              </button>

              <div className="text-center">
                <p className="text-zinc-500 mb-2">Didn't receive the code?</p>
                {timer > 0 ? (
                  <p className="text-zinc-400 font-medium">Resend code in <span className="text-primary-container">0:{timer < 10 ? `0${timer}` : timer}</span></p>
                ) : (
                  <button className="text-primary-container font-bold hover:underline">
                    Resend code
                  </button>
                )}
              </div>
            </div>
          </form>

          <div className="mt-20 text-center">
            <p className="text-zinc-400 text-xs">
              © 2024 Aero-Tech Performance. Secure Verification System.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
