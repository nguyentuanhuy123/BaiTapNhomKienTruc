import React from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

const TechnologyPage = () => {
  const technologies = [
    {
      title: "Nitrogen Foam",
      description: "Infused with liquid nitrogen for ultimate responsiveness and lightweight cushioning.",
      icon: "cyclone",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBBNoyw5tw_apvnvrgw2x-OE17XYJ-332TXchL3o0yuh0oYsMMIbBXw-r0WCKI5O1UZYHocPaPE-AXltTb56x7aPd82z8zw7sxj4koA8yJ_WKsd0o6qhs5sM-4YXbxT7dojRB7YsQ6MIOcz04nU4zEplNTIJ2We-ik6znqi9BJVof6onTJJCWZeQQwsDAp8EwSzGcyUbVVATgYYAFEQt_D_Thb13bJ3RuEn2jFDgMmN-jmG2Bl_xRnMtshtMukIYNauO3PdTJ1L61c",
      color: "bg-blue-500"
    },
    {
      title: "Carbon Plate",
      description: "A full-length carbon fiber plate that acts like a springboard for explosive energy.",
      icon: "bolt",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDlNG2P_20pGAAH4lD1LeB5XUPjnnrFc1Iqelb0yK_m5pU8LBE-r1o2Qc0s98A3ibTFLgTBWkOL_Of5_oOH0uULbeky0x39_KUNX_WWNODTJMDKHAAG_xht_x1U0gWH71RRXbW_ZtO1ozzj1yI-3cDWy7ha4kOLfSxqzcFYN7BgdKbZ3lfnDHt2k0E7f0EimKNABOUGiiHM7MyaiARflxSGkXj5a0rOM8LI-ylmoHgcPxKHEJvRV5XyWWxtRcZzNNk7Ff5qopsRjeM",
      color: "bg-zinc-800"
    },
    {
      title: "Aero-Knit Upper",
      description: "Precision-engineered mesh that adapts to your foot for a second-skin feel.",
      icon: "Waves",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAz8dC1bhFHEAQ2mtNFLQZxqJmpjz1uJPQ9tyYXoNc7rwV15o7-D75288YdtAAKKdypNXvg0TQPkXwx4KrxVYtGLy1Y8QFAJn59CzNJ5ZIWzxeEPSWLJfwOaVcrAYiFm2wa2WCcg3BqmSlLGKsurmYPaiVyBpPBX8RxDPfdD_cljsNm3rmYifWKbkTaYmRTu4dlqrzVuyXY6Dwy_rNMSZ7ANnXgxhHwSNqWEo--SpdWOepwnSFNzUCcqqtmsZdRJbbjCUv5yW_MigY",
      color: "bg-cyan-500"
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />

      <main className="flex-1 pt-24">
        {/* Hero Section */}
        <section className="py-20 px-margin-mobile md:px-margin-desktop bg-zinc-900 text-white overflow-hidden relative">
          <div className="max-w-container-max mx-auto relative z-10">
            <span className="text-primary-container font-black uppercase text-xs tracking-widest mb-6 block">Innovation Lab</span>
            <h1 className="text-5xl md:text-8xl font-space-grotesk font-black italic uppercase leading-none tracking-tighter mb-8">
              The Science <br />of Speed
            </h1>
            <p className="text-zinc-400 text-lg md:text-xl max-w-2xl leading-relaxed">
              We don't just make shoes. We engineer performance. Explore the cutting-edge technologies that power every Velocity silhouette.
            </p>
          </div>
          <div className="absolute top-0 right-0 w-1/2 h-full bg-primary-container/10 blur-[120px] rounded-full translate-x-1/2"></div>
        </section>

        {/* Tech Detail Grid */}
        <section className="py-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto w-full">
          <div className="space-y-32">
            {technologies.map((tech, idx) => (
              <div key={idx} className={`flex flex-col lg:flex-row gap-16 items-center ${idx % 2 !== 0 ? 'lg:flex-row-reverse' : ''}`}>
                <div className="flex-1">
                  <div className={`w-14 h-14 ${tech.color} text-white rounded-2xl flex items-center justify-center mb-8 shadow-lg`}>
                    <span className="material-symbols-outlined text-2xl">{tech.icon}</span>
                  </div>
                  <h2 className="text-4xl md:text-5xl font-black font-space-grotesk uppercase italic mb-6 tracking-tight">{tech.title}</h2>
                  <p className="text-zinc-500 text-lg leading-relaxed mb-10">
                    {tech.description} Our engineering team spent over 2,000 hours testing this innovation to ensure it meets the highest standards of elite athletes.
                  </p>
                  <div className="flex gap-4">
                    <div className="bg-zinc-50 px-6 py-4 rounded-2xl">
                      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Responsiveness</p>
                      <p className="font-bold text-zinc-900">+23% Increase</p>
                    </div>
                    <div className="bg-zinc-50 px-6 py-4 rounded-2xl">
                      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Weight</p>
                      <p className="font-bold text-zinc-900">-15% Lighter</p>
                    </div>
                  </div>
                </div>
                <div className="flex-1 w-full bg-zinc-50 rounded-[60px] p-12 md:p-20 relative group">
                  <img src={tech.image} alt={tech.title} className="w-full h-full object-contain transform group-hover:scale-110 transition-transform duration-700 drop-shadow-2xl" />
                  <div className="absolute inset-0 bg-primary-container/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-[60px]"></div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default TechnologyPage;
