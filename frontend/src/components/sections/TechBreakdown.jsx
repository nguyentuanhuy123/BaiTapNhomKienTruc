import React from 'react';
import { TECH_FEATURES } from '../../constants/mockData';

const TechBreakdown = () => {
  return (
    <section className="py-section-gap px-margin-mobile md:px-margin-desktop bg-primary-fixed overflow-hidden relative">
      <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
        <div className="w-full h-full bg-[radial-gradient(circle_at_center,_#0052FF_0%,_transparent_70%)]"></div>
      </div>

      <div className="max-w-container-max mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="font-space-grotesk font-black text-headline-xl text-zinc-900 leading-none mb-2 uppercase">
              The Anatomy <br />of Air
            </h2>
            <p className="text-body-lg text-zinc-700 mb-12 max-w-lg">
              Our revolutionary nitrogen-infused foam delivers 23% more energy return than traditional EVA, creating a weightless sensation for every stride.
            </p>

            <div className="space-y-6">
              {TECH_FEATURES.map((feature, idx) => (
                <div 
                  key={idx} 
                  className={`glass-surface p-8 rounded-lg ambient-shadow flex gap-6 items-start transition-all duration-500 hover:scale-[1.02] ${feature.translate}`}
                >
                  <div className="w-12 h-12 bg-primary-container text-white rounded-full flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined">{feature.icon}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-headline-md text-zinc-900 mb-2">{feature.title}</h4>
                    <p className="text-secondary">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <img 
              alt="Shoe Tech Breakdown" 
              className="w-full relative z-20 animate-pulse-slow" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBBNoyw5tw_apvnvrgw2x-OE17XYJ-332TXchL3o0yuh0oYsMMIbBXw-r0WCKI5O1UZYHocPaPE-AXltTb56x7aPd82z8zw7sxj4koA8yJ_WKsd0o6qhs5sM-4YXbxT7dojRB7YsQ6MIOcz04nU4zEplNTIJ2We-ik6znqi9BJVof6onTJJCWZeQQwsDAp8EwSzGcyUbVVATgYYAFEQt_D_Thb13bJ3RuEn2jFDgMmN-jmG2Bl_xRnMtshtMukIYNauO3PdTJ1L61c" 
            />
            <div className="absolute -inset-10 bg-primary-container/10 blur-[100px] rounded-full z-0"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TechBreakdown;
