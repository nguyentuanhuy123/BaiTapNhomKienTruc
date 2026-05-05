import React from 'react';
import { TECH_FEATURES } from '../../constants/mockData';
import { Link } from 'react-router-dom';

const TechBreakdown = () => {
  return (
    <section className="py-24 md:py-32 px-margin-mobile md:px-margin-desktop bg-white overflow-hidden relative">
      <div className="max-w-container-max mx-auto relative z-10">
        <div className="flex flex-col lg:flex-row gap-16 lg:items-center">
          {/* Left Side: Content & Cards */}
          <div className="flex-1">
            <div className="mb-16">
              <span className="text-primary-container font-black uppercase text-xs tracking-[0.3em] mb-4 block">Engineered for Peak Performance</span>
              <h2 className="font-space-grotesk font-black text-5xl md:text-7xl text-zinc-900 leading-[0.9] mb-8 uppercase italic tracking-tighter">
                The Anatomy <br />of Velocity
              </h2>
              <p className="text-zinc-500 text-lg max-w-lg leading-relaxed">
                Every component is meticulously crafted to maximize energy return and minimize fatigue. Discover the science behind the speed.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              {TECH_FEATURES.map((feature, idx) => (
                <div 
                  key={idx} 
                  className="group bg-zinc-50 hover:bg-primary-container p-8 rounded-[32px] transition-all duration-500 cursor-default"
                >
                  <div className="w-14 h-14 bg-white text-primary-container group-hover:bg-white/20 group-hover:text-white rounded-2xl flex items-center justify-center mb-6 transition-colors duration-500">
                    <span className="material-symbols-outlined text-2xl font-bold">{feature.icon}</span>
                  </div>
                  <h4 className="font-black text-xl text-zinc-900 group-hover:text-white mb-3 uppercase italic transition-colors duration-500 tracking-tight">{feature.title}</h4>
                  <p className="text-zinc-500 group-hover:text-white/80 text-sm leading-relaxed transition-colors duration-500">{feature.description}</p>
                </div>
              ))}
            </div>

            {/* Custom Button from Screenshot */}
            <div className="flex justify-start">
              <Link 
                to="/technology" 
                className="px-8 py-3 border-2 border-zinc-900 rounded-xl text-primary-container font-black text-sm uppercase tracking-widest hover:bg-zinc-900 hover:text-white transition-all duration-300 shadow-[0_10px_20px_-10px_rgba(0,0,0,0.1)]"
              >
                View All Technologies
              </Link>
            </div>
          </div>

          {/* Right Side: Hero Image */}
          <div className="flex-1 relative">
            <div className="relative z-10 animate-float">
              <img 
                alt="Shoe Tech Breakdown" 
                className="w-full drop-shadow-[0_50px_50px_rgba(0,82,255,0.15)]" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBBNoyw5tw_apvnvrgw2x-OE17XYJ-332TXchL3o0yuh0oYsMMIbBXw-r0WCKI5O1UZYHocPaPE-AXltTb56x7aPd82z8zw7sxj4koA8yJ_WKsd0o6qhs5sM-4YXbxT7dojRB7YsQ6MIOcz04nU4zEplNTIJ2We-ik6znqi9BJVof6onTJJCWZeQQwsDAp8EwSzGcyUbVVATgYYAFEQt_D_Thb13bJ3RuEn2jFDgMmN-jmG2Bl_xRnMtshtMukIYNauO3PdTJ1L61c" 
              />
            </div>
            
            {/* Ambient Glows */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary-container/5 blur-[120px] rounded-full -z-10 animate-pulse-slow"></div>
            <div className="absolute top-1/4 right-0 w-32 h-32 bg-blue-400/20 blur-[60px] rounded-full animate-bounce-slow"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TechBreakdown;
