import React, { useState, useEffect } from 'react';
import { commentService } from '../services/commentService';
import { useAlert } from '../contexts/AlertContext';

const AdminCommentsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [replyText, setReplyText] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRating, setFilterRating] = useState('ALL'); // ALL, POSITIVE (4-5), NEGATIVE (1-3), UNANSWERED
  const { showAlert } = useAlert();

  const loadReviews = async () => {
    const data = await commentService.getAllReviews();
    setReviews(data);
  };

  useEffect(() => {
    loadReviews();
    
    // Thiết lập Polling tự động làm mới danh sách bình luận sau mỗi 4 giây để có trải nghiệm Real-time
    const interval = setInterval(() => {
      loadReviews();
    }, 4000);
    
    const unsubscribe = commentService.subscribe(() => {
      loadReviews();
    });

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const handleReplySubmit = async (reviewId, e) => {
    e.preventDefault();
    const content = replyText[reviewId];
    if (!content || !content.trim()) return;

    try {
      await commentService.addAdminReply(reviewId, content);
      setReplyText(prev => ({ ...prev, [reviewId]: '' }));
      showAlert('Đã gửi phản hồi bình luận thành công!', 'success');
      loadReviews();
    } catch (error) {
      console.error(error);
      showAlert('Không thể phản hồi bình luận!', 'error');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bình luận này và tất cả phản hồi của nó? Hành động này không thể hoàn tác.")) {
      return;
    }

    try {
      await commentService.deleteReview(reviewId);
      showAlert('Đã xóa bình luận tiêu cực thành công!', 'success');
      loadReviews();
    } catch (error) {
      console.error(error);
      showAlert('Không thể xóa bình luận này!', 'error');
    }
  };

  const handleTextChange = (reviewId, value) => {
    setReplyText(prev => ({ ...prev, [reviewId]: value }));
  };

  // Filter logic
  const filteredReviews = reviews.filter((rev) => {
    // Search filter
    const matchesSearch = 
      rev.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rev.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (rev.title && rev.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      String(rev.productId).includes(searchQuery);

    // Rating filter
    let matchesRating = true;
    if (filterRating === 'POSITIVE') {
      matchesRating = rev.rating >= 4;
    } else if (filterRating === 'NEGATIVE') {
      matchesRating = rev.rating <= 3;
    } else if (filterRating === 'UNANSWERED') {
      matchesRating = !rev.replies || rev.replies.length === 0;
    }

    return matchesSearch && matchesRating;
  });

  return (
    <div className="space-y-10 w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <span className="bg-primary-container/10 text-primary-container text-xs px-4 py-1.5 rounded-full font-black uppercase tracking-widest mb-4 inline-block">
            Community Engagement
          </span>
          <h1 className="text-4xl font-space-grotesk font-black text-zinc-900 leading-none uppercase italic">
            Reviews & Comments
          </h1>
          <p className="text-zinc-500 mt-2 text-sm">
            Xem phản hồi của khách hàng về sản phẩm, trả lời thắc mắc và quản lý nội dung tiêu cực.
          </p>
        </div>
      </div>

      {/* Modern Filter Toolbar */}
      <div className="bg-white rounded-3xl p-6 border border-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-96">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 text-lg">
            search
          </span>
          <input
            type="text"
            placeholder="Tìm theo tên, nội dung, Product ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl pl-12 pr-5 py-3 outline-none focus:ring-2 focus:ring-primary-container transition-all text-xs font-bold"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {[
            { id: 'ALL', label: 'Tất cả' },
            { id: 'NEGATIVE', label: 'Tiêu cực (1-3⭐)', color: 'hover:bg-red-50 text-red-600 border-red-100 bg-red-50/20' },
            { id: 'POSITIVE', label: 'Tích cực (4-5⭐)', color: 'hover:bg-emerald-50 text-emerald-600 border-emerald-100 bg-emerald-50/20' },
            { id: 'UNANSWERED', label: 'Chưa phản hồi', color: 'hover:bg-amber-50 text-amber-600 border-amber-100 bg-amber-50/20' }
          ].map((tab) => {
            const isActive = filterRating === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setFilterRating(tab.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all border ${
                  isActive 
                    ? 'bg-zinc-900 text-white border-zinc-900 shadow-md' 
                    : tab.color || 'bg-zinc-50 text-zinc-600 border-zinc-100 hover:bg-zinc-100'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Review Feed List */}
      <div className="space-y-6">
        {filteredReviews.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
            <span className="material-symbols-outlined text-4xl text-zinc-300 mb-3">
              chat_bubble_outline
            </span>
            <p className="text-zinc-500 font-bold text-sm">Không tìm thấy bình luận nào phù hợp.</p>
          </div>
        ) : (
          filteredReviews.map((rev) => (
            <div key={rev.id} className="bg-white rounded-3xl p-8 border border-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.04)] transition-all relative group">
              
              {/* Delete Button (Hover effect & styled) */}
              <button
                onClick={() => handleDeleteReview(rev.id)}
                className="absolute top-8 right-8 text-zinc-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-xl transition-all md:opacity-0 group-hover:opacity-100"
                title="Xóa bình luận tiêu cực"
              >
                <span className="material-symbols-outlined text-lg">delete</span>
              </button>

              {/* Header info */}
              <div className="flex justify-between items-start mb-6 pr-10">
                <div>
                  <span className="text-[9px] font-black text-primary-container uppercase tracking-widest bg-primary-container/5 px-2.5 py-1 rounded-md">
                    Product ID: {rev.productId}
                  </span>
                  {rev.title && <h3 className="text-lg font-black text-zinc-900 mt-3 font-space-grotesk">{rev.title}</h3>}
                  <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider mt-1">
                    Đăng bởi {rev.name} • {rev.date}
                  </p>
                </div>

                {/* Stars */}
                <div className={`flex px-3 py-1 rounded-xl items-center gap-1 border ${
                  rev.rating <= 3 
                    ? 'text-red-500 bg-red-50 border-red-100' 
                    : 'text-amber-500 bg-amber-50 border-amber-100'
                }`}>
                  <span className="material-symbols-outlined text-sm fill-current">star</span>
                  <span className="text-xs font-black">{rev.rating}.0</span>
                </div>
              </div>

              {/* Review Content */}
              <div className="flex flex-col md:flex-row gap-6 mb-6">
                {rev.image && (
                  <div className="w-24 h-24 bg-zinc-50 border border-zinc-100 rounded-xl overflow-hidden p-1 shrink-0">
                    <img src={rev.image} alt="Attachment" className="w-full h-full object-contain" />
                  </div>
                )}
                <p className="text-zinc-600 text-sm leading-relaxed self-center">{rev.content}</p>
              </div>

              {/* Existing Replies */}
              {rev.replies && rev.replies.length > 0 && (
                <div className="bg-zinc-50 rounded-2xl p-6 border border-zinc-100 mb-6 space-y-4">
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Phản hồi đã gửi</p>
                  {rev.replies.map((reply, idx) => (
                    <div key={idx} className="border-l-4 border-primary-container pl-4">
                      <p className="text-xs font-black text-zinc-900 uppercase tracking-wider">{reply.name}</p>
                      <p className="text-[10px] text-zinc-400 font-bold tracking-wider mt-0.5">{reply.date}</p>
                      <p className="text-xs text-zinc-600 leading-relaxed mt-2">{reply.content}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Write Reply Form */}
              <form onSubmit={(e) => handleReplySubmit(rev.id, e)} className="flex gap-4 items-end pt-4 border-t border-zinc-50">
                <div className="flex-1">
                  <label className="block text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-2">Viết phản hồi của bạn</label>
                  <input
                    type="text"
                    required
                    placeholder="Cảm ơn khách hàng hoặc trả lời thắc mắc của họ..."
                    value={replyText[rev.id] || ''}
                    onChange={(e) => handleTextChange(rev.id, e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-5 py-3 outline-none focus:ring-2 focus:ring-primary-container transition-all text-xs font-bold"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-primary-container text-white px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-[0.98] transition-all shadow-[0_5px_15px_-2px_rgba(0,82,255,0.3)] shrink-0 h-10"
                >
                  Gửi phản hồi
                </button>
              </form>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminCommentsPage;
