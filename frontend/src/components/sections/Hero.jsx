import React from 'react';
import Button from '../common/Button';

const Hero = () => {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-20 px-margin-mobile md:px-margin-desktop overflow-hidden">
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(0,82,255,0.05)_0%,_rgba(249,249,249,1)_70%)]"></div>
      
      <div className="relative z-10 text-center max-w-4xl mx-auto">
        <span className="inline-block px-4 py-1.5 mb-6 bg-primary-container text-white text-label-sm rounded-full font-bold uppercase tracking-widest animate-fade-in">
          Velocity Series 2024
        </span>
        
        <h1 className="font-space-grotesk font-black text-[64px] md:text-[120px] leading-[0.9] tracking-tighter text-zinc-900 mb-8">
          UNLEASH YOUR <span className="text-primary-container">VELOCITY</span>
        </h1>

        <div className="relative w-full aspect-video md:aspect-[21/9] flex items-center justify-center mb-12">
          <img 
            alt="VELOCITY 3D Render" 
            className="w-full max-w-3xl object-contain drop-shadow-[0_35px_35px_rgba(0,82,255,0.2)] transform hover:scale-105 transition-transform duration-700"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDlNG2P_20pGAAH4lD1LeB5XUPjnnrFc1Iqelb0yK_m5pU8LBE-r1o2Qc0s98A3ibTFLgTBWkOL_Of5_oOH0uULbeky0x39_KUNX_WWNODTJMDKHAAG_xht_x1U0gWH71RRXbW_ZtO1ozzj1yI-3cDWy7ha4kOLfSxqzcFYN7BgdKbZ3lfnDHt2k0E7f0EimKNABOUGiiHM7MyaiARflxSGkXj5a0rOM8LI-ylmoHgcPxKHEJvRV5XyWWxtRcZzNNk7Ff5qopsRjeM" 
          />
        </div>

        <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
          <Button variant="primary">Shop Collection</Button>
          <Button variant="secondary">View Tech Specs</Button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
