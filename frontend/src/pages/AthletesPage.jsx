import React from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import Button from '../components/common/Button';

const AthletesPage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative h-[80vh] flex items-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuC0RVALbOkLApO_oXHaOyd3IWWZ8Qvks5oe-kHfsvF7mW75C2xuAjpcGIUGPI-gSj9wL5DFdjTwLg_yykk_NcgMz11D88DnV5QQxcfFf4FoHCVaz7jq_AAA-M-5q0HAfN4gImuC1pbHX3O-2ndzjL2XmHZyS22WnMsUdZUWrRqOnwHNhjd8mmVUM0GPKSzSzLW_npyBKLUzzaJQEANEWMxYnif5AKpViFptzlZJo8Kuyuv24ENPSUdQmcRrEaPBZPQ2io5_yTbQ4b8" 
              alt="Athlete Hero" 
              className="w-full h-full object-cover scale-110 blur-[2px]" 
            />
            <div className="absolute inset-0 bg-black/40"></div>
          </div>

          <div className="relative z-10 max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop w-full">
            <div className="max-w-2xl">
              <span className="bg-primary-container text-white text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-widest mb-6 inline-block">Elite Series 2024</span>
              <h1 className="text-white text-[64px] md:text-[80px] font-space-grotesk font-black leading-[0.9] mb-8 uppercase italic tracking-tighter">
                Powered by <br />Performance
              </h1>
              <p className="text-white/80 text-lg mb-10 max-w-lg leading-relaxed">
                Meet the individuals redefining human potential. Velocity athletes aren't just wearing shoes; they're engineering victory with every stride.
              </p>
              <Button>Explore The Roster</Button>
            </div>
          </div>
        </section>

        {/* The Elite Roster - Bento Grid */}
        <section className="py-24 max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="flex justify-between items-end mb-16">
            <div>
              <h2 className="text-label-sm font-black text-primary-container uppercase tracking-[0.3em] mb-4">The Elite Roster</h2>
              <p className="text-zinc-500 font-medium italic">Precision engineered for the world's most demanding arenas.</p>
            </div>
            <div className="flex gap-4">
              <button className="material-symbols-outlined w-12 h-12 flex items-center justify-center rounded-full border border-zinc-200 hover:bg-zinc-50 transition-all">chevron_left</button>
              <button className="material-symbols-outlined w-12 h-12 flex items-center justify-center rounded-full border border-zinc-200 hover:bg-zinc-50 transition-all">chevron_right</button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Elias Kiptum */}
            <div className="md:col-span-8 relative rounded-[40px] overflow-hidden aspect-[16/9] group">
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAz8dC1bhFHEAQ2mtNFLQZxqJmpjz1uJPQ9tyYXoNc7rwV15o7-D75288YdtAAKKdypNXvg0TQPkXwx4KrxVYtGLy1Y8QFAJn59CzNJ5ZIWzxeEPSWLJfwOaVcrAYiFm2wa2WCcg3BqmSlLGKsurmYPaiVyBpPBX8RxDPfdD_cljsNm3rmYifWKbkTaYmRTu4dlqrzVuyXY6Dwy_rNMSZ7ANnXgxhHwSNqWEo--SpdWOepwnSFNzUCcqqtmsZdRJbbjCUv5yW_MigY" 
                alt="Elias Kiptum" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-12">
                <span className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-2">Long Distance</span>
                <h3 className="text-white text-4xl font-black font-space-grotesk mb-2">Elias Kiptum</h3>
                <p className="text-white/60 text-sm">2-Time World Champion & Course Record Holder</p>
                <div className="absolute bottom-12 right-12 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex flex-col">
                  <span className="text-white/40 text-[8px] font-black uppercase tracking-widest mb-1">Current Shoe</span>
                  <span className="text-white text-xs font-bold uppercase">VELOCITY AERO-MAX 2</span>
                </div>
              </div>
            </div>

            {/* Sarah Chen */}
            <div className="md:col-span-4 relative rounded-[40px] overflow-hidden group">
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuC0RVALbOkLApO_oXHaOyd3IWWZ8Qvks5oe-kHfsvF7mW75C2xuAjpcGIUGPI-gSj9wL5DFdjTwLg_yykk_NcgMz11D88DnV5QQxcfFf4FoHCVaz7jq_AAA-M-5q0HAfN4gImuC1pbHX3O-2ndzjL2XmHZyS22WnMsUdZUWrRqOnwHNhjd8mmVUM0GPKSzSzLW_npyBKLUzzaJQEANEWMxYnif5AKpViFptzlZJo8Kuyuv24ENPSUdQmcRrEaPBZPQ2io5_yTbQ4b8" 
                alt="Sarah Chen" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-10">
                <span className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-2 font-space-grotesk italic">Sprint</span>
                <h3 className="text-white text-2xl font-black font-space-grotesk mb-1">Sarah 'Flash' Chen</h3>
                <p className="text-white/60 text-xs mb-6 italic">Olympic Gold Medalist (100m)</p>
                <div className="border-t border-white/20 pt-4">
                  <span className="text-white/40 text-[8px] font-black uppercase tracking-widest mb-1 block">Selected Footwear</span>
                  <span className="text-white text-xs font-bold uppercase">VELOCITY SONIC SPARK</span>
                </div>
              </div>
            </div>

            {/* Marcus Thorne */}
            <div className="md:col-span-4 relative rounded-[40px] overflow-hidden aspect-[4/5] group">
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCOOtGdRouhmTO68TX8XYPVaGoERnpK2bMeHycOU7JX23qISGbVRJaEyY8Wxc_9yiKjMwm5RmmTB5L-BCJzuYc8RzcfbJ2xaYKGw7EGp_v3J3F54G9Vbc1RfzyrtyuuOXTMvemQWEBb3uhbK7-PVQr3kbo7-w9JoGP7BDkxdJT1UYk7X2hfwFzbngsk03gAvhxgS34bSWpKCfUsFSlnFzaIMahsBlzGMZ6XsJVJRMR5FQkmnEv1W7rX1u7PdktXzv2AvjNdfvEY-q4" 
                alt="Marcus Thorne" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-10">
                <span className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-2">Trail</span>
                <h3 className="text-white text-2xl font-black font-space-grotesk mb-1">Marcus Thorne</h3>
                <p className="text-white/60 text-xs">UTMB 1st Place - 2023</p>
              </div>
            </div>

            {/* Join the team CTA */}
            <div className="md:col-span-8 bg-indigo-100 rounded-[40px] p-12 flex flex-col items-center justify-center text-center">
              <p className="text-primary-container font-black text-xs uppercase tracking-widest mb-4 italic">And you?</p>
              <h3 className="text-primary-container text-2xl font-bold max-w-sm mb-8 leading-relaxed">
                Our next pro might be training right now. Join the Velocity Community and push your limits.
              </h3>
              <button className="bg-primary-container text-white px-8 py-4 rounded-full font-bold flex items-center gap-3 shadow-lg hover:scale-105 transition-all">
                Join the Pro Team
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
          </div>
        </section>

        {/* Testimonial Spotlight */}
        <section className="py-32 bg-zinc-50 overflow-hidden">
          <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <div className="relative rounded-[40px] overflow-hidden aspect-square ambient-shadow">
                <img 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAz8dC1bhFHEAQ2mtNFLQZxqJmpjz1uJPQ9tyYXoNc7rwV15o7-D75288YdtAAKKdypNXvg0TQPkXwx4KrxVYtGLy1Y8QFAJn59CzNJ5ZIWzxeEPSWLJfwOaVcrAYiFm2wa2WCcg3BqmSlLGKsurmYPaiVyBpPBX8RxDPfdD_cljsNm3rmYifWKbkTaYmRTu4dlqrzVuyXY6Dwy_rNMSZ7ANnXgxhHwSNqWEo--SpdWOepwnSFNzUCcqqtmsZdRJbbjCUv5yW_MigY" 
                  alt="Jordan Hayes" 
                  className="w-full h-full object-cover scale-150 grayscale" 
                />
              </div>
              <div className="relative">
                <span className="material-symbols-outlined text-[80px] text-primary-container/10 absolute -top-12 -left-8">format_quote</span>
                <p className="text-[40px] md:text-[56px] font-space-grotesk font-black text-zinc-900 leading-[1.1] mb-12 italic">
                  "The transition from ground contact to energy return in the Aero-Max is unlike anything I've experienced. It doesn't just support my pace; it demands I go faster."
                </p>
                <div className="flex items-center gap-6">
                  <div className="w-16 h-[2px] bg-primary-container"></div>
                  <div>
                    <p className="font-black text-zinc-900 uppercase tracking-widest">Jordan Hayes</p>
                    <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest mt-1">Elite Triathlon Competitor</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="bg-zinc-900 rounded-[50px] p-20 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary-container/20 to-transparent opacity-50"></div>
            <div className="relative z-10">
              <h2 className="text-white text-sm font-black uppercase tracking-[0.4em] mb-4">Engineered for the elite. Made for everyone.</h2>
              <p className="text-white/60 text-lg max-w-xl mx-auto mb-12">
                Get the exact gear worn by world-record holders and Olympic champions.
              </p>
              <div className="flex flex-col md:flex-row justify-center gap-6">
                <Button>Shop the Athlete's Choice</Button>
                <button className="px-10 py-5 rounded-full border border-white/20 text-white font-bold hover:bg-white/10 transition-all">
                  Learn about our Tech
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default AthletesPage;
