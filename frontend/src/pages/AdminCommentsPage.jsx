import React, { useState, useEffect } from 'react';
import { commentService } from '../services/commentService';
import { useAlert } from '../contexts/AlertContext';

const AdminCommentsPage = () => {
  const [reviews, setReviews] = useState(commentService.getAllReviews());
  const [replyText, setReplyText] = useState({});
  const { showAlert } = useAlert();

  useEffect(() => {
    return commentService.subscribe(() => {
      setReviews(commentService.getAllReviews());
    });
  }, []);

  const handleReplySubmit = (reviewId, e) => {
    e.preventDefault();
    const content = replyText[reviewId];
    if (!content || !content.trim()) return;

    commentService.addAdminReply(reviewId, content);
    setReplyText(prev => ({ ...prev, [reviewId]: '' }));
    showAlert('Đã gửi phản hồi bình luận thành công!', 'success');
  };

  const handleTextChange = (reviewId, value) => {
    setReplyText(prev => ({ ...prev, [reviewId]: value }));
  };

  return (
    <div className="space-y-10 w-full">
      {/* Header */}
      <div>
        <span className="bg-primary-container/10 text-primary-container text-xs px-4 py-1.5 rounded-full font-black uppercase tracking-widest mb-4 inline-block">
          Community Engagement
        </span>
        <h1 className="text-4xl font-space-grotesk font-black text-zinc-900 leading-none uppercase italic">
          Reviews & Comments
        </h1>
        <p className="text-zinc-500 mt-2 text-sm">
          Xem phản hồi của khách hàng về sản phẩm và trả lời thắc mắc của người dùng.
        </p>
      </div>

      {/* Review Feed List */}
      <div className="space-y-6">
        {reviews.map((rev) => (
          <div key={rev.id} className="bg-white rounded-3xl p-8 border border-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.04)] transition-all">
            {/* Header info */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="text-[9px] font-black text-primary-container uppercase tracking-widest bg-primary-container/5 px-2.5 py-1 rounded-md">
                  Product ID: {rev.productId}
                </span>
                <h3 className="text-lg font-black text-zinc-900 mt-3 font-space-grotesk">{rev.title}</h3>
                <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider mt-1">
                  Đăng bởi {rev.name} • {rev.date}
                </p>
              </div>

              {/* Stars */}
              <div className="flex text-amber-500 bg-amber-50 px-3 py-1 rounded-xl items-center gap-1 border border-amber-100">
                <span className="material-symbols-outlined text-sm fill-amber-500">star</span>
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
            {rev.replies.length > 0 && (
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
        ))}
      </div>
    </div>
  );
};

export default AdminCommentsPage;
