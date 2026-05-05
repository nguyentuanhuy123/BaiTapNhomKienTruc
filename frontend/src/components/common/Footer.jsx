import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-zinc-50 border-t border-zinc-200 w-full py-12 mt-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-8 max-w-[1440px] mx-auto items-center">
        <div>
          <div className="text-lg font-black text-zinc-900 mb-4">AERO-TECH</div>
          <div className="flex flex-wrap gap-6 mb-4">
            <a className="text-zinc-500 hover:text-blue-600 transition-colors font-space-grotesk text-xs font-medium tracking-widest hover:underline underline-offset-4" href="#">PRIVACY</a>
            <a className="text-zinc-500 hover:text-blue-600 transition-colors font-space-grotesk text-xs font-medium tracking-widest hover:underline underline-offset-4" href="#">TERMS</a>
            <a className="text-zinc-500 hover:text-blue-600 transition-colors font-space-grotesk text-xs font-medium tracking-widest hover:underline underline-offset-4" href="#">TECH SPECS</a>
            <a className="text-zinc-500 hover:text-blue-600 transition-colors font-space-grotesk text-xs font-medium tracking-widest hover:underline underline-offset-4" href="#">CONTACT</a>
          </div>
        </div>
        <div className="md:text-right">
          <p className="text-zinc-500 font-space-grotesk text-xs font-medium tracking-widest uppercase">
            © 2024 AERO-TECH PERFORMANCE. ENGINEERED FOR MOTION.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
