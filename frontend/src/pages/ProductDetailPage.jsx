import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import ProductCard from '../components/common/ProductCard';
import { EXPLORE_PRODUCTS } from '../constants/mockData';

const ProductDetailPage = () => {
  const { id } = useParams();
  const [selectedSize, setSelectedSize] = useState('US 10');
  const [selectedColor, setSelectedColor] = useState('Blue');
  const [mainImage, setMainImage] = useState("https://lh3.googleusercontent.com/aida-public/AB6AXuDlNG2P_20pGAAH4lD1LeB5XUPjnnrFc1Iqelb0yK_m5pU8LBE-r1o2Qc0s98A3ibTFLgTBWkOL_Of5_oOH0uULbeky0x39_KUNX_WWNODTJMDKHAAG_xht_x1U0gWH71RRXbW_ZtO1ozzj1yI-3cDWy7ha4kOLfSxqzcFYN7BgdKbZ3lfnDHt2k0E7f0EimKNABOUGiiHM7MyaiARflxSGkXj5a0rOM8LI-ylmoHgcPxKHEJvRV5XyWWxtRcZzNNk7Ff5qopsRjeM");

  const thumbnails = [
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDlNG2P_20pGAAH4lD1LeB5XUPjnnrFc1Iqelb0yK_m5pU8LBE-r1o2Qc0s98A3ibTFLgTBWkOL_Of5_oOH0uULbeky0x39_KUNX_WWNODTJMDKHAAG_xht_x1U0gWH71RRXbW_ZtO1ozzj1yI-3cDWy7ha4kOLfSxqzcFYN7BgdKbZ3lfnDHt2k0E7f0EimKNABOUGiiHM7MyaiARflxSGkXj5a0rOM8LI-ylmoHgcPxKHEJvRV5XyWWxtRcZzNNk7Ff5qopsRjeM",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAz8dC1bhFHEAQ2mtNFLQZxqJmpjz1uJPQ9tyYXoNc7rwV15o7-D75288YdtAAKKdypNXvg0TQPkXwx4KrxVYtGLy1Y8QFAJn59CzNJ5ZIWzxeEPSWLJfwOaVcrAYiFm2wa2WCcg3BqmSlLGKsurmYPaiVyBpPBX8RxDPfdD_cljsNm3rmYifWKbkTaYmRTu4dlqrzVuyXY6Dwy_rNMSZ7ANnXgxhHwSNqWEo--SpdWOepwnSFNzUCcqqtmsZdRJbbjCUv5yW_MigY",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCOOtGdRouhmTO68TX8XYPVaGoERnpK2bMeHycOU7JX23qISGbVRJaEyY8Wxc_9yiKjMwm5RmmTB5L-BCJzuYc8RzcfbJ2xaYKGw7EGp_v3J3F54G9Vbc1RfzyrtyuuOXTMvemQWEBb3uhbK7-PVQr3kbo7-w9JoGP7BDkxdJT1UYk7X2hfwFzbngsk03gAvhxgS34bSWpKCfUsFSlnFzaIMahsBlzGMZ6XsJVJRMR5FQkmnEv1W7rX1u7PdktXzv2AvjNdfvEY-q4",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCHN-KL1gRCNjQ5i218BP0Qw62MlHgsce6FIsDq-Ew9Odjd7joRKs78wP3h_qAuxgFc-gqbk_BHsKy1S2HE2qcjpDr0gKdwCOws0EsLBTUJ9qFAqsd9nLmfo12sYTGv3LUA2xhAO9Xbv_9Fhp_2sNZq8w0CSm8nDf8b35IhqBQMgY6yq_vfOsEamCjAbNpaTBiaP_zSwPuiSyO7OJW5mT3I8hUP4kd8jz8uBs47mr1ERIt0Nd3VkXjTT4SQ-DmxaoWiOw3OijwOrsg"
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />

      <main className="flex-1 pt-24 pb-20">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-zinc-400 text-xs mb-8">
            <Link to="/" className="hover:text-zinc-900">SHOP</Link>
            <span className="material-symbols-outlined text-[10px]">chevron_right</span>
            <Link to="/explore" className="hover:text-zinc-900 uppercase">RUNNING</Link>
            <span className="material-symbols-outlined text-[10px]">chevron_right</span>
            <span className="text-zinc-900 font-bold uppercase">AERO-KNIT X1</span>
          </nav>

          {/* Product Hero */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-24">
            {/* Gallery */}
            <div className="lg:col-span-7 space-y-4">
              <div className="relative aspect-[4/3] bg-zinc-50 rounded-3xl overflow-hidden group">
                <span className="absolute top-6 left-6 bg-primary-container text-white px-4 py-1.5 rounded-full text-label-sm font-bold uppercase z-10 shadow-lg">New Arrival</span>
                <img 
                  src={mainImage} 
                  alt="Product" 
                  className="w-full h-full object-contain p-12 transition-transform duration-700 group-hover:scale-105" 
                />
              </div>
              <div className="grid grid-cols-4 gap-4">
                {thumbnails.map((img, i) => (
                  <button 
                    key={i} 
                    onClick={() => setMainImage(img)}
                    className={`aspect-square rounded-2xl bg-zinc-50 overflow-hidden border-2 transition-all p-2 ${mainImage === img ? 'border-primary-container scale-[0.98]' : 'border-transparent hover:border-zinc-200'}`}
                  >
                    <img src={img} alt={`Thumb ${i}`} className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            </div>

            {/* Info */}
            <div className="lg:col-span-5 flex flex-col">
              <h1 className="text-headline-xl font-space-grotesk font-black text-zinc-900 mb-2 leading-none">AERO-KNIT X1</h1>
              <p className="text-headline-md font-bold text-primary-container mb-6">$245.00</p>
              
              <p className="text-zinc-500 mb-8 leading-relaxed">
                Engineered for ultra-motion. The X1 combines our proprietary AERO-KNIT upper with a dual-density carbon-infused midsole for unparalleled energy return and a cloud-like sensation.
              </p>

              <div className="mb-8">
                <p className="text-label-md font-bold text-zinc-900 mb-4 uppercase tracking-widest">Color: <span className="text-zinc-400 font-normal">Electric Blue / Alpine White</span></p>
                <div className="flex gap-4">
                  {['#0052FF', '#1A1C1C', '#E2E2E2'].map((c, i) => (
                    <button 
                      key={i} 
                      className={`w-10 h-10 rounded-full border-2 p-0.5 transition-all ${i === 0 ? 'border-primary-container scale-110 shadow-md' : 'border-transparent'}`}
                    >
                      <div className="w-full h-full rounded-full" style={{ backgroundColor: c }}></div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-10">
                <div className="flex justify-between items-center mb-4">
                  <p className="text-label-md font-bold text-zinc-900 uppercase tracking-widest">Select Size</p>
                  <button className="text-xs font-bold text-primary-container hover:underline uppercase">Size Guide</button>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {['US 8', 'US 9', 'US 10', 'US 11', 'US 12', 'US 13'].map((s) => (
                    <button 
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`py-3 rounded-xl border-2 font-bold transition-all ${selectedSize === s ? 'border-primary-container bg-primary-container/5 text-primary-container' : 'border-zinc-100 text-zinc-500 hover:border-zinc-200'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <button className="w-full bg-primary-container text-white font-bold py-5 rounded-2xl shadow-[0_15px_30px_-5px_rgba(0,82,255,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 mb-8">
                <span className="material-symbols-outlined">shopping_bag</span>
                ADD TO BAG
              </button>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-zinc-50 p-4 rounded-xl flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary-container">local_shipping</span>
                  <span className="text-xs font-bold text-zinc-600 uppercase">Express Shipping</span>
                </div>
                <div className="bg-zinc-50 p-4 rounded-xl flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary-container">verified</span>
                  <span className="text-xs font-bold text-zinc-600 uppercase">30-Day Guarantee</span>
                </div>
              </div>
            </div>
          </div>

          {/* Product DNA */}
          <div className="mb-24 text-center">
            <h2 className="text-label-sm font-black text-primary-container uppercase tracking-[0.3em] mb-12">Product DNA</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: 'weight', title: 'ULTRA-LIGHTWEIGHT', desc: 'At only 180g, the X1 is engineered to disappear on your feet, allowing for explosive speed without the drag.' },
                { icon: 'texture', title: 'AERO-KNIT TECH', desc: 'Multi-layered knit construction ensures maximum airflow where you need it most during intense performance.' },
                { icon: 'bolt', title: 'ENERGY RETURN', desc: 'Our proprietary foam tech recovers 94% of energy on every stride, propelling you forward with less effort.' }
              ].map((item, i) => (
                <div key={i} className="bg-white p-10 rounded-3xl ambient-shadow border border-zinc-50 text-center flex flex-col items-center group hover:translate-y-[-8px] transition-all">
                  <div className="w-16 h-16 bg-primary-container/5 rounded-2xl flex items-center justify-center text-primary-container mb-8 group-hover:bg-primary-container group-hover:text-white transition-all">
                    <span className="material-symbols-outlined text-3xl">{item.icon}</span>
                  </div>
                  <h3 className="font-bold text-headline-md text-zinc-900 mb-4">{item.title}</h3>
                  <p className="text-zinc-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Marketing Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-32">
            <div className="relative rounded-[40px] overflow-hidden aspect-[4/3] group">
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuC0RVALbOkLApO_oXHaOyd3IWWZ8Qvks5oe-kHfsvF7mW75C2xuAjpcGIUGPI-gSj9wL5DFdjTwLg_yykk_NcgMz11D88DnV5QQxcfFf4FoHCVaz7jq_AAA-M-5q0HAfN4gImuC1pbHX3O-2ndzjL2XmHZyS22WnMsUdZUWrRqOnwHNhjd8mmVUM0GPKSzSzLW_npyBKLUzzaJQEANEWMxYnif5AKpViFptzlZJo8Kuyuv24ENPSUdQmcRrEaPBZPQ2io5_yTbQ4b8" 
                alt="Action" 
                className="w-full h-full object-cover transition-transform duration-[10s] group-hover:scale-110" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-12">
                <p className="text-white/60 text-xs font-black uppercase tracking-widest mb-2">Street Ready</p>
                <h3 className="text-white text-3xl font-black font-space-grotesk max-w-sm">Optimized for urban surfaces and high-intensity road work.</h3>
              </div>
            </div>
            <div className="flex flex-col justify-between gap-8">
              <div className="bg-primary-container rounded-[40px] p-12 text-white">
                <h3 className="text-3xl font-black font-space-grotesk mb-4">A REVOLUTIONARY WEAVE</h3>
                <p className="text-white/80 leading-relaxed mb-0">Every fiber in the AERO-KNIT upper is calculated for structural integrity and dynamic flexibility. It moves exactly how your foot moves.</p>
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div className="bg-white rounded-[40px] p-10 border border-zinc-100 flex flex-col items-center justify-center text-center ambient-shadow">
                  <p className="text-4xl font-black font-space-grotesk text-zinc-900 mb-2 italic">8mm</p>
                  <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest">Heel Drop</p>
                </div>
                <div className="bg-white rounded-[40px] p-10 border border-zinc-100 flex flex-col items-center justify-center text-center ambient-shadow">
                  <p className="text-4xl font-black font-space-grotesk text-zinc-900 mb-2 italic">Dual</p>
                  <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest">Density Carbon</p>
                </div>
              </div>
            </div>
          </div>

          {/* Athlete Reviews */}
          <div className="mb-32">
            <div className="text-center mb-16">
              <h2 className="text-label-sm font-black text-primary-container uppercase tracking-[0.3em] mb-4">Athlete Reviews</h2>
              <p className="text-zinc-500 font-medium italic">Tested and approved by the world's fastest.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { name: 'Sarah Wilson', role: 'Pro Marathoner', quote: "The energy return is unlike anything I've felt. It feels like the shoe is actively pushing you into your next stride. Incredible engineering." },
                { name: 'Marcus Reed', role: 'Olympic Sprinter', quote: "Lightweight enough for track work, but enough cushion for those long recovery miles. The AERO-KNIT X1 is my new daily trainer." },
                { name: 'David Chen', role: 'Endurance Coach', quote: "I've never worn a shoe that felt this natural. The knit upper is supportive without being restrictive. Perfect for my explosive movements." }
              ].map((rev, i) => (
                <div key={i} className="bg-zinc-50 p-10 rounded-[32px] flex flex-col h-full">
                  <div className="flex text-primary-container mb-6">
                    {[...Array(5)].map((_, j) => <span key={j} className="material-symbols-outlined text-sm">star</span>)}
                  </div>
                  <p className="text-zinc-700 italic leading-relaxed mb-8 flex-1">"{rev.quote}"</p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-zinc-200 rounded-full overflow-hidden">
                      <img src={`https://i.pravatar.cc/150?u=${rev.name}`} alt={rev.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="font-bold text-zinc-900 text-sm uppercase">{rev.name}</p>
                      <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider">{rev.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendation */}
          <div className="mb-32">
            <h2 className="text-label-sm font-black text-primary-container uppercase tracking-[0.3em] mb-12 text-center">You May Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
              {EXPLORE_PRODUCTS.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>

          {/* Customer Reviews */}
          <div className="border-t border-zinc-100 pt-24">
            <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-20">
              <div>
                <h2 className="text-label-sm font-black text-primary-container uppercase tracking-[0.3em] mb-8">Customer Reviews</h2>
                <div className="flex items-end gap-6">
                  <p className="text-7xl font-black font-space-grotesk text-zinc-900 leading-none italic">4.8</p>
                  <div className="mb-1">
                    <div className="flex text-primary-container mb-2">
                      {[...Array(5)].map((_, j) => <span key={j} className="material-symbols-outlined">star</span>)}
                    </div>
                    <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest">Based on 124 reviews</p>
                  </div>
                </div>
              </div>
              <button className="bg-primary-container text-white px-8 py-4 rounded-xl font-bold flex items-center gap-3 shadow-lg hover:scale-105 transition-all">
                <span className="material-symbols-outlined">edit</span>
                WRITE A REVIEW
              </button>
            </div>

            <div className="space-y-12">
              {[
                { title: "ULTIMATE ROAD COMPANION", date: "OCT 12, 2023", name: "MICHAEL R.", content: "The responsiveness of the carbon midsole is a game changer for my training intervals. Transition from mid-foot to toe-off feels incredibly natural and snappy." },
                { title: "LIGHT AS A FEATHER", date: "OCT 05, 2023", name: "ELENA B.", content: "I was skeptical about the 180g claim until I put them on. It's like wearing socks with extreme propulsion. Highly recommend for competitive runners." }
              ].map((rev, i) => (
                <div key={i} className="border-b border-zinc-50 pb-12">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex text-primary-container">
                      {[...Array(5)].map((_, j) => <span key={j} className="material-symbols-outlined text-sm">star</span>)}
                    </div>
                    <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest">{rev.date}</span>
                  </div>
                  <h4 className="font-bold text-zinc-900 text-lg mb-4">{rev.title}</h4>
                  <p className="text-zinc-500 leading-relaxed mb-6">{rev.content}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-900 font-black text-xs uppercase">{rev.name}</span>
                    <span className="w-1 h-1 bg-zinc-200 rounded-full"></span>
                    <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px] text-green-500">verified</span>
                      Verified Buyer
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-16">
              <button className="text-primary-container font-black text-xs uppercase tracking-[0.2em] border-b-2 border-primary-container pb-1 hover:text-blue-700 hover:border-blue-700 transition-all">
                Load More Reviews
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetailPage;
