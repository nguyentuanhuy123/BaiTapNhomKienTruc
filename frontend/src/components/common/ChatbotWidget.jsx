import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { chatbotService } from '../../services/chatbotService';

const ChatbotWidget = () => {
  const { pathname } = useLocation();
  
  // Do not render AI Chatbot on admin dashboard, login, or register pages
  if (pathname.startsWith('/admin') || pathname === '/login' || pathname === '/register') {
    return null;
  }

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Xin chào! Em là Trợ lý AI Aero-Tech. Em có thể giúp anh/chị tìm kiếm các mẫu giày thể thao cao cấp hoặc giải đáp các thắc mắc về đơn hàng. Anh/chị đang quan tâm đến sản phẩm nào ạ? 👟',
      products: []
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input;
    setInput('');
    setMessages((prev) => [...prev, { sender: 'user', text: userText, products: [] }]);
    setLoading(true);

    try {
      const data = await chatbotService.sendMessage(userText);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: data.responseText,
          products: data.products || []
        }
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: 'Rất tiếc, hệ thống đang gặp gián đoạn kết nối. Anh/chị vui lòng thử lại sau nhé! 😥',
          products: []
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Floating Chat Bubble Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-gradient-to-tr from-zinc-950 to-zinc-800 text-white rounded-full flex items-center justify-center shadow-[0_12px_40px_rgba(0,0,0,0.25)] hover:scale-110 active:scale-95 transition-all duration-300 border border-zinc-700/30 group"
        >
          <span className="material-symbols-outlined text-2xl group-hover:rotate-12 transition-transform duration-300">chat_bubble</span>
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-container opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-primary-container"></span>
          </span>
        </button>
      )}

      {/* Expanded Elegant Glassmorphic Chat Window */}
      {isOpen && (
        <div className="w-[380px] sm:w-[400px] h-[550px] bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md rounded-[32px] border border-zinc-100 shadow-[0_20px_60px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="bg-gradient-to-r from-zinc-950 to-zinc-800 p-5 flex items-center justify-between text-white border-b border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-container/20 rounded-2xl flex items-center justify-center border border-primary-container/30 relative">
                <span className="material-symbols-outlined text-primary-container text-xl animate-pulse">smart_toy</span>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-zinc-950"></span>
              </div>
              <div>
                <h3 className="font-bold text-sm tracking-tight">AI Trợ Lý Aero-Tech</h3>
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Hỗ trợ trực tuyến 24/7</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-all"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>

          {/* Chat Messages Logs */}
          <div className="flex-1 p-5 overflow-y-auto space-y-5 bg-zinc-50/50">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                {/* Bubble message */}
                <div
                  className={`max-w-[85%] px-4 py-3 rounded-2xl text-xs font-bold leading-relaxed shadow-[0_4px_15px_rgba(0,0,0,0.01)] ${
                    msg.sender === 'user'
                      ? 'bg-zinc-900 text-white rounded-br-none'
                      : 'bg-white text-zinc-800 rounded-bl-none border border-zinc-100'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>

                {/* Render product recommendation cards inside the bubble */}
                {msg.products && msg.products.length > 0 && (
                  <div className="w-full mt-3 overflow-x-auto no-scrollbar flex gap-3 py-1">
                    {msg.products.map((prod) => (
                      <div
                        key={prod.id}
                        className="w-48 bg-white border border-zinc-100 rounded-2xl p-3 shrink-0 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                      >
                        <div className="w-full h-24 bg-zinc-50 rounded-xl p-2 mb-2 flex items-center justify-center overflow-hidden">
                          <img
                            src={prod.imageUrl || 'https://via.placeholder.com/150'}
                            alt={prod.name}
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                        <div>
                          <h4 className="text-[11px] font-black text-zinc-900 line-clamp-1 leading-tight">{prod.name}</h4>
                          <span className="bg-primary-container/10 text-primary-container text-[8px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider mt-1 inline-block">
                            {prod.category}
                          </span>
                        </div>
                        <div className="flex justify-between items-center mt-3 pt-2 border-t border-zinc-50">
                          <span className="font-black text-xs font-space-grotesk italic text-zinc-950">${prod.price.toFixed(2)}</span>
                          <Link
                            to={`/product/${prod.id}`}
                            className="bg-zinc-950 hover:bg-zinc-800 text-white text-[9px] font-black px-3 py-1.5 rounded-lg uppercase tracking-wider transition-all"
                            onClick={() => setIsOpen(false)}
                          >
                            Mua Ngay
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Typing Loader animation */}
            {loading && (
              <div className="flex items-center gap-1 bg-white border border-zinc-100 px-4 py-3 rounded-2xl rounded-bl-none w-fit">
                <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Inputs */}
          <form onSubmit={handleSend} className="p-4 bg-white border-t border-zinc-100 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nhập câu hỏi (Ví dụ: giày chạy bộ)..."
              className="flex-1 bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-2.5 text-xs text-zinc-800 font-bold outline-none focus:bg-white focus:border-zinc-300 transition-all"
            />
            <button
              type="submit"
              className="w-10 h-10 bg-zinc-950 text-white rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-lg">send</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatbotWidget;
