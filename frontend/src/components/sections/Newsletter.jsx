import React from 'react';

const Newsletter = () => {
  return (
    <section className="py-section-gap px-margin-mobile md:px-margin-desktop bg-zinc-900 text-white rounded-[40px] mx-margin-mobile md:mx-margin-desktop mb-margin-desktop overflow-hidden relative">
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-container rounded-full blur-[120px] opacity-20"></div>
      
      <div className="max-w-3xl mx-auto text-center relative z-10">
        <h2 className="font-space-grotesk font-black text-headline-xl text-white leading-none mb-2 uppercase">
          Stay at the Speed of Light.
        </h2>
        <p className="text-zinc-400 text-body-lg mb-10">
          Join the AERO-TECH inner circle for exclusive drops and performance insights.
        </p>
        
        <div className="flex flex-col md:flex-row gap-4">
          <input 
            className="flex-1 bg-zinc-800 border-none rounded-full px-8 py-5 text-white placeholder:text-zinc-500 focus:ring-2 focus:ring-primary-container outline-none" 
            placeholder="Enter your email" 
            type="email" 
          />
          <button className="bg-white text-zinc-900 font-bold px-10 py-5 rounded-full hover:bg-primary-container hover:text-white transition-all duration-300 transform hover:scale-105">
            Subscribe
          </button>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
