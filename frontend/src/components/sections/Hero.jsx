import React, { useState, useEffect } from 'react';
import Button from '../common/Button';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';

const Hero = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  // Auto-play logic: change index every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Mouse tilt logic
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);
  const rotateX = useTransform(mouseYSpring, [-300, 300], [10, -10]);
  const rotateY = useTransform(mouseXSpring, [-300, 300], [-10, 10]);

  function handleMouseMove(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - (rect.left + rect.width / 2)) / 2);
    y.set((e.clientY - (rect.top + rect.height / 2)) / 2);
  }

  // Position Definitions
  const positions = [
    { x: 0, z: 100, scale: 1.1, opacity: 1, filter: 'blur(0px)' },     // Front
    { x: -250, z: -100, scale: 0.7, opacity: 0.4, filter: 'blur(2px)' }, // Back Left
    { x: 250, z: -100, scale: 0.7, opacity: 0.4, filter: 'blur(2px)' }  // Back Right
  ];

  // Helper to get index-based position
  const getPos = (shoeIndex) => {
    const posIndex = (shoeIndex - activeIndex + 3) % 3;
    return positions[posIndex];
  };

  return (
    <section 
      className="relative min-h-screen w-full bg-zinc-950 flex items-center overflow-hidden pt-20 select-none"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { x.set(0); y.set(0); }}
    >
      {/* Background Grid */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      </div>

      <div className="container mx-auto px-margin-mobile md:px-margin-desktop relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          
          {/* Left Side: Content */}
          <div className="flex flex-col items-start text-left max-w-xl">
            <motion.div 
              key={activeIndex}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full mb-6"
            >
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-400">
                Model: {activeIndex === 0 ? 'BLUE-PRIME' : activeIndex === 1 ? 'RED-LINE' : 'VOLT-CORE'}
              </span>
            </motion.div>

            <h1 className="font-space-grotesk font-black text-[56px] md:text-[80px] leading-[0.9] text-white uppercase italic mb-8">
              Shift Your <br />
              <span className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
                Perspective
              </span>
            </h1>

            <p className="text-zinc-400 text-lg mb-10 leading-relaxed">
              Experience the evolution of speed. Engineered with our revolutionary <span className="text-white font-bold italic">Aero-Foam+</span> technology. The ultimate trio for your rotation.
            </p>

            <div className="flex gap-4">
              <Button className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-none skew-x-[-12deg]">
                <span className="inline-block skew-x-[12deg] font-black">Shop Collection</span>
              </Button>
              <Button variant="outline" className="border-zinc-800 text-white px-8 py-4 rounded-none skew-x-[-12deg] hover:bg-white/5">
                <span className="inline-block skew-x-[12deg] font-black">Specs</span>
              </Button>
            </div>

            {/* Pagination Dots */}
            <div className="mt-12 flex gap-3">
              {[0, 1, 2].map((i) => (
                <div 
                  key={i} 
                  onClick={() => setActiveIndex(i)}
                  className={`h-1.5 transition-all duration-500 cursor-pointer ${i === activeIndex ? 'w-12 bg-blue-500' : 'w-4 bg-zinc-800 hover:bg-zinc-700'}`}
                />
              ))}
            </div>
          </div>

          {/* Right Side: Auto-Rotating 3D Carousel */}
          <div className="relative flex justify-center items-center h-[500px] lg:h-[600px]">
            
            <div className="absolute bottom-10 w-[300px] h-[30px] bg-blue-500/10 blur-[40px] rounded-full"></div>

            <motion.div 
              style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
              className="relative w-full h-full flex justify-center items-center"
            >
              {/* Shoe 1 (Blue) */}
              <motion.div 
                animate={getPos(0)}
                transition={{ duration: 2.0, ease: [0.4, 0, 0.2, 1] }}
                className="absolute w-full max-w-[550px]"
              >
                <img src="/images/shoe-hero-realistic.png" alt="Blue" draggable="false" className="w-full h-auto" style={{ mixBlendMode: 'screen' }} />
              </motion.div>

              {/* Shoe 2 (Red) */}
              <motion.div 
                animate={getPos(1)}
                transition={{ duration: 2.0, ease: [0.4, 0, 0.2, 1] }}
                className="absolute w-full max-w-[550px]"
              >
                <img src="/images/shoe-hero-red.png" alt="Red" draggable="false" className="w-full h-auto" style={{ mixBlendMode: 'screen' }} />
              </motion.div>

              {/* Shoe 3 (Volt) */}
              <motion.div 
                animate={getPos(2)}
                transition={{ duration: 2.0, ease: [0.4, 0, 0.2, 1] }}
                className="absolute w-full max-w-[550px]"
              >
                <img src="/images/shoe-hero-volt.png" alt="Volt" draggable="false" className="w-full h-auto" style={{ mixBlendMode: 'screen' }} />
              </motion.div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Hero;
