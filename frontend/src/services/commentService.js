import { notificationService } from './notificationService';

let reviews = [
  {
    id: 1,
    productId: 1,
    title: "SỰ LỰA CHỌN TUYỆT VỜI CHO ĐƯỜNG CHẠY",
    date: "12 Tháng 5, 2024",
    name: "MICHAEL R.",
    content: "Đế carbon siêu nảy giúp bước chạy của tôi nhẹ nhàng và thanh thoát hơn rất nhiều. Rất đáng đồng tiền bát gạo!",
    rating: 5,
    verified: true,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDlNG2P_20pGAAH4lD1LeB5XUPjnnrFc1Iqelb0yK_m5pU8LBE-r1o2Qc0s98A3ibTFLgTBWkOL_Of5_oOH0uULbeky0x39_KUNX_WWNODTJMDKHAAG_xht_x1U0gWH71RRXbW_ZtO1ozzj1yI-3cDWy7ha4kOLfSxqzcFYN7BgdKbZ3lfnDHt2k0E7f0EimKNABOUGiiHM7MyaiARflxSGkXj5a0rOM8LI-ylmoHgcPxKHEJvRV5XyWWxtRcZzNNk7Ff5qopsRjeM",
    replies: [
      { name: "Global Admin", content: "Cảm ơn Michael đã tin tưởng lựa chọn Aero-Tech! Chúc bạn có những đường chạy thật thăng hoa.", date: "13 Tháng 5, 2024" }
    ]
  },
  {
    id: 2,
    productId: 1,
    title: "SIÊU NHẸ NHƯ KHÔNG KHÍ",
    date: "05 Tháng 5, 2024",
    name: "ELENA B.",
    content: "Lúc đầu tôi hơi nghi ngờ về trọng lượng 180g nhưng khi đi vào chân thì thực sự kinh ngạc. Ôm chân, thông thoáng và rất tôn dáng.",
    rating: 4,
    verified: true,
    image: "",
    replies: []
  }
];

let listeners = [];

export const commentService = {
  subscribe(callback) {
    listeners.push(callback);
    return () => {
      listeners = listeners.filter(l => l !== callback);
    };
  },

  notify() {
    listeners.forEach(callback => callback());
  },

  getReviewsByProduct(productId) {
    return reviews.filter(r => r.productId === parseInt(productId));
  },

  getAllReviews() {
    return reviews;
  },

  addReview(productId, name, title, content, rating, image = "") {
    const newRev = {
      id: Date.now(),
      productId: parseInt(productId),
      title: title.toUpperCase(),
      date: new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      name: name.toUpperCase(),
      content,
      rating,
      verified: true,
      image,
      replies: []
    };
    reviews = [newRev, ...reviews];
    this.notify();

    // Notify Admin of a new comment
    notificationService.addAdminNotification(
      'Bình luận mới từ khách hàng',
      `${name} đã đánh giá ${rating} sao cho sản phẩm ID: ${productId}.`,
      'new_comment'
    );
  },

  addAdminReply(reviewId, replyContent) {
    let reviewerName = '';
    let productName = '';

    reviews = reviews.map(r => {
      if (r.id === reviewId) {
        reviewerName = r.name;
        productName = `Sản phẩm ID ${r.productId}`;
        return {
          ...r,
          replies: [
            ...r.replies,
            {
              name: "Global Admin",
              content: replyContent,
              date: new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
            }
          ]
        };
      }
      return r;
    });

    this.notify();

    // Trigger Notification to the user that admin replied to their comment
    notificationService.addUserNotification(
      'Admin đã phản hồi bình luận của bạn',
      `Phản hồi: "${replyContent}"`,
      'admin_reply'
    );
  }
};
