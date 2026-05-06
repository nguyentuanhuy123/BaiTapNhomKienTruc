import React from 'react';

const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  const actionId = item.backendItemId ?? item.id;

  return (
    <div className="flex gap-6 pb-8 border-b border-zinc-100 group">
      <div className="w-32 h-32 md:w-40 md:h-40 bg-zinc-50 rounded-3xl overflow-hidden p-4 flex items-center justify-center shrink-0">
        <img 
          src={item.image} 
          alt={item.name} 
          className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" 
        />
      </div>

      <div className="flex-1 flex flex-col justify-between py-2">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-zinc-900 text-lg uppercase mb-1 tracking-tight">{item.name}</h3>
            <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest">{item.variant} • {item.size}</p>
          </div>
          <p className="font-black text-zinc-900 text-lg italic">${(item.price * item.quantity).toFixed(2)}</p>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4 bg-zinc-50 px-4 py-2 rounded-full">
            <button 
              onClick={() => onUpdateQuantity(actionId, -1)}
              className="material-symbols-outlined text-sm text-zinc-400 hover:text-zinc-900 transition-colors"
            >
              remove
            </button>
            <span className="font-bold text-sm w-4 text-center">{item.quantity}</span>
            <button 
              onClick={() => onUpdateQuantity(actionId, 1)}
              className="material-symbols-outlined text-sm text-zinc-400 hover:text-zinc-900 transition-colors"
            >
              add
            </button>
          </div>
          <button 
            onClick={() => onRemove(actionId)}
            className="text-zinc-300 hover:text-error transition-colors flex items-center gap-1 group/btn"
          >
            <span className="material-symbols-outlined text-lg">delete</span>
            <span className="text-[10px] font-black uppercase tracking-widest opacity-0 group-hover/btn:opacity-100 transition-opacity">Remove</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
