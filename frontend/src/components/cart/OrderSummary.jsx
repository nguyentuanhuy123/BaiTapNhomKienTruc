import React from 'react';
import { Link } from 'react-router-dom';

const OrderSummary = ({ subtotal, shipping, tax, total }) => {
  return (
    <div className="bg-zinc-900 rounded-[40px] p-10 text-white sticky top-28">
      <h2 className="text-xl font-bold mb-8 uppercase tracking-widest">Order Summary</h2>
      
      <div className="space-y-4 mb-8">
        <div className="flex justify-between text-zinc-400 font-medium">
          <span>Subtotal</span>
          <span className="text-white font-bold">${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-zinc-400 font-medium">
          <span>Shipping</span>
          <span className="text-white font-bold">${shipping.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-zinc-400 font-medium">
          <span>Estimated Tax</span>
          <span className="text-white font-bold">${tax.toFixed(2)}</span>
        </div>
      </div>

      <div className="border-t border-white/10 pt-6 mb-10">
        <div className="flex justify-between items-end">
          <span className="text-zinc-400 font-bold uppercase text-xs tracking-widest">Total</span>
          <span className="text-3xl font-black font-space-grotesk italic">${total.toFixed(2)}</span>
        </div>
      </div>

      <div className="mb-8">
        <div className="relative">
          <input 
            type="text" 
            placeholder="PROMO CODE" 
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm outline-none focus:border-white/30 transition-all uppercase font-bold tracking-widest placeholder:text-zinc-600"
          />
          <button className="absolute right-4 top-1/2 -translate-y-1/2 text-primary-container font-black text-[10px] uppercase tracking-widest hover:text-white transition-colors">Apply</button>
        </div>
      </div>

      <Link to="/checkout" className="block w-full">
        <button className="w-full bg-primary-container text-white font-bold py-5 rounded-2xl shadow-[0_20px_40px_-10px_rgba(0,82,255,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3">
          CHECKOUT
          <span className="material-symbols-outlined">arrow_forward</span>
        </button>
      </Link>

      <div className="mt-8 flex justify-center gap-4">
        <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="Paypal" className="h-4 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer" />
        <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-4 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer" />
        <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-4 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer" />
      </div>
    </div>
  );
};

export default OrderSummary;
