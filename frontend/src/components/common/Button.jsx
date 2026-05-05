import React from 'react';

const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyles = "px-12 py-5 rounded-full font-bold text-body-lg transition-all duration-300 active:scale-95";
  
  const variants = {
    primary: "bg-primary-container text-white hover:scale-105 shadow-[0_20px_40px_-10px_rgba(0,82,255,0.4)]",
    secondary: "glass-surface text-primary-container hover:bg-white/90",
    outline: "border-2 rounded-full font-bold text-body-lg transition-all border-[#FF3B30] text-[#FF3B30] hover:bg-[#FF3B30] hover:text-white",
    dark: "bg-white text-zinc-900 font-bold px-10 py-5 rounded-full hover:bg-primary-container hover:text-white",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
