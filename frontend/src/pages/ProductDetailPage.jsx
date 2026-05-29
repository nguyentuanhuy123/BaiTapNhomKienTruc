import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import ProductCard from '../components/common/ProductCard';
import { productService } from '../services/productService';
import { useNavigate } from 'react-router-dom';
import { cartService } from '../services/cartService';
import { useAuth } from '../contexts/AuthContext';
import { commentService } from '../services/commentService';
import { useUserStatusContext } from '../contexts/UserStatusContext';


const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const { sendAdminNotification } = useUserStatusContext();
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [mainImage, setMainImage] = useState("");
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isLiked, setIsLiked] = useState(false);
  const { isLoggedIn, user } = useAuth();
  const [reviews, setReviews] = useState(commentService.getReviewsByProduct(id));
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewContent, setReviewContent] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewImage, setReviewImage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [cartError, setCartError] = useState("");
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);
  const navigate = useNavigate();

  const authErrorMessage = "Vui long dang nhap de them san pham vao gio hang.";
  const isAuthError = (e) => [401, 403].includes(e?.response?.status);


  const readLocalCart = () => {
    try {
      const raw = localStorage.getItem("cart");
      return raw ? JSON.parse(raw) : { items: [] };
    } catch {
      return { items: [] };
    }
  };

  const writeLocalCart = (cart) => {
    localStorage.setItem("cart", JSON.stringify(cart));
  };


  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await productService.getProductById(id);

        if (data) {
          setProduct(data);

          if (data.sizes?.length > 0) {
            setSelectedSize(`US ${Number(data.sizes[0])}`);
          }

          if (data.colors?.length > 0) {
            setSelectedColor(data.colors[0]);
          }

          if (data.imageResponses?.length > 0) {
            setMainImage(data.imageResponses[0].url);
          } else if (data.image) {
            setMainImage(data.image);
          }

          productService.getAllProducts(0, 4, data.categoryName || '')
            .then(related => {
              if (related && related.content) {
                setRelatedProducts(
                  related.content.filter(p => p.id !== parseInt(id)).slice(0, 4)
                );
              }
            })
            .catch(e => console.warn('Related products failed:', e));
        }
      } catch (e) {
        console.error('Failed to fetch core product info:', e);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    if (isLoggedIn && user?.email && id) {
      productService.isInWishlist(user.email, id)
        .then(setIsLiked)
        .catch(e => console.warn('Failed to check wishlist status:', e));
    } else {
      setIsLiked(false);
    }
  }, [isLoggedIn, user, id]);

  useEffect(() => {
    if (isLoggedIn && product) {
      const skuCode = product.skuCode || `SKU-${product.id}`;
      productService.checkPurchase(skuCode)
        .then(setHasPurchased)
        .catch(e => {
          console.warn('Failed to check purchase status:', e);
          setHasPurchased(false);
        });
    } else {
      setHasPurchased(false);
    }
  }, [isLoggedIn, product]);

  useEffect(() => {
    setReviews(commentService.getReviewsByProduct(id));
    return commentService.subscribe(() => {
      setReviews(commentService.getReviewsByProduct(id));
    });
  }, [id]);

  const compressImage = (base64Str, maxWidth = 400, maxHeight = 400) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.6));
      };
      img.onerror = () => {
        resolve(base64Str);
      };
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!reviewTitle || !reviewContent) return;

    setSubmitting(true);
    const commenterName = user?.name || user?.email || 'Khách hàng';
    
    let finalImage = reviewImage;
    if (reviewImage && reviewImage.startsWith('data:image')) {
      try {
        finalImage = await compressImage(reviewImage);
      } catch (err) {
        console.warn('Failed to compress image:', err);
      }
    }

    commentService.addReview(id, commenterName, reviewTitle, reviewContent, reviewRating, finalImage);
    
    setReviewTitle('');
    setReviewContent('');
    setReviewRating(5);
    setReviewImage('');
    setShowReviewForm(false);
    setSubmitting(false);
  };

  const handleWriteReviewClick = () => {
    if (!isLoggedIn) {
      alert("Vui lòng đăng nhập để đánh giá sản phẩm!");
      return;
    }
    if (!hasPurchased) {
      alert("🔒 Chỉ những khách hàng đã mua sản phẩm này mới được phép đánh giá!");
      return;
    }
    setShowReviewForm(!showReviewForm);
  };

  const handleWishlistToggle = async () => {
    if (!isLoggedIn || !user?.email) {
      alert("Vui lòng đăng nhập để thêm sản phẩm vào danh sách yêu thích!");
      return;
    }
    try {
      await productService.toggleWishlist(user.email, id);
      setIsLiked(!isLiked);
    } catch (error) {
      console.error('Failed to toggle wishlist:', error);
    }
  };


  const handleAddToCart = async () => {
      if (!product) return;
 
      const skuCode = product.skuCode || `SKU-${product.id}`;
     const primaryImage = product.imageResponses?.[0]?.url || product.image || "";
     const productName = product.name || skuCode;
     const productPrice = product.price || 0;
  
      try {
        setCartError("");
        // 1) Sync to backend cart
        const updated = await cartService.addItem({
           skuCode,
          productId: product.id,
          name: productName,
          price: productPrice,
          image: primaryImage,
           quantity: 1,
           size: selectedSize || "N/A",
           color: selectedColor || "N/A",
         });

      const normalizeKey = (value) => (value == null ? "" : String(value).trim().toLowerCase());
      const matched = updated?.items?.find(
        (it) =>
          normalizeKey(it.skuCode) === normalizeKey(skuCode) &&
          normalizeKey(it.size) === normalizeKey(selectedSize || "N/A") &&
          normalizeKey(it.color) === normalizeKey(selectedColor || "N/A")
      );

      // 2) Build local cart item for UI display
      const localCart = readLocalCart();
      const existing = localCart.items.find(
          (it) =>
              it.skuCode === skuCode &&
              it.size === selectedSize &&
              it.color === selectedColor
      );

      if (existing) {
        existing.quantity += 1;
        if (matched?.id != null) {
          existing.backendItemId = matched.id;
        }
      } else {
        localCart.items.push({
           id: `local-${product.id}-${selectedSize}-${selectedColor}`,
           backendItemId: matched?.id ?? null,
           productId: product.id,
           skuCode,
          name: productName,
          price: productPrice,
          image: primaryImage,
           size: selectedSize || "N/A",
           color: selectedColor || "N/A",
           quantity: 1,
         });
       }

      localCart.updatedAt = new Date().toISOString();
      writeLocalCart(localCart);

      // Dispatch custom event to notify Navbar and other components to update badge count
      window.dispatchEvent(new Event("cartUpdated"));

      sendAdminNotification(
        'Thêm giỏ hàng',
        `Khách hàng ${user?.email || 'Ẩn danh'} đã thêm sản phẩm "${productName}" (Size: ${selectedSize || 'N/A'}, Màu: ${selectedColor || 'N/A'}) vào giỏ hàng.`,
        'cart'
      );

      // Show beautiful success toast
      setShowSuccessToast(true);
      setTimeout(() => {
        setShowSuccessToast(false);
      }, 4000);
    } catch (error) {
      console.error("Failed to add to cart:", error);
      if (isAuthError(error)) {
        setCartError(authErrorMessage);
      }
    }
  };


  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Navbar />
        <main className="flex-1 pt-24 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-zinc-100 border-t-primary-container rounded-full animate-spin"></div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Navbar />
        <main className="flex-1 pt-24 text-center py-20">
          <h2 className="text-2xl font-bold text-zinc-900 mb-4">Product Not Found</h2>
          <Link to="/explore" className="text-primary-container font-bold hover:underline">Back to Explore</Link>
        </main>
        <Footer />
      </div>
    );
  }

  const thumbnails = product.imageResponses?.map(img => img.url) || [];

  return (
    <div className="flex flex-col min-h-screen bg-white selection:bg-blue-100">
      <Navbar />

      {/* Toast Notification */}
      {showSuccessToast && (
        <div className="fixed top-24 right-6 z-[2000] transition-all duration-300 ease-out">
          <div className="bg-zinc-950 text-white border border-zinc-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.4)] rounded-2xl p-4 flex items-center gap-4 max-w-sm">
            <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400 shrink-0">
              <span className="material-symbols-outlined text-2xl font-black">check_circle</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] leading-none mb-1.5">Đã thêm vào giỏ hàng</p>
              <p className="text-xs font-black text-white truncate max-w-[160px] font-space-grotesk">{product?.name}</p>
            </div>
            <Link to="/cart" className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase tracking-widest py-2.5 px-4 rounded-xl transition-all shrink-0 shadow-[0_4px_12px_rgba(37,99,235,0.3)]">
              Xem Giỏ
            </Link>
          </div>
        </div>
      )}

      <main className="flex-1 pt-32 pb-20">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-zinc-400 text-xs mb-8">
            <Link to="/" className="hover:text-zinc-900">SHOP</Link>
            <span className="material-symbols-outlined text-[10px]">chevron_right</span>
            <Link to="/explore" className="hover:text-zinc-900 uppercase">{product.categoryName || 'EXPLORE'}</Link>
            <span className="material-symbols-outlined text-[10px]">chevron_right</span>
            <span className="text-zinc-900 font-bold uppercase">{product.name}</span>
          </nav>

          {/* Product Hero */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-24">
            {/* Gallery */}
            <div className="lg:col-span-7 space-y-4">
              <div className="relative aspect-[4/3] bg-zinc-50 rounded-3xl overflow-hidden group">
                {product.isNew && (
                  <span className="absolute top-6 left-6 bg-primary-container text-white px-4 py-1.5 rounded-full text-label-sm font-bold uppercase z-10 shadow-lg">New Arrival</span>
                )}
                {product.discountPercentage > 0 && (
                  <span className="absolute top-6 right-6 bg-error text-white px-4 py-1.5 rounded-full text-label-sm font-bold uppercase z-10 shadow-lg">-{product.discountPercentage}%</span>
                )}
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
              <h1 className="text-headline-xl font-space-grotesk font-black text-zinc-900 mb-2 leading-none">{product.name}</h1>
              <div className="flex items-center gap-4 mb-6">
                <p className="text-headline-md font-bold text-primary-container">${Number(product.price || 0).toFixed(2)}</p>
                {product.oldPrice && (
                  <p className="text-zinc-400 line-through font-bold">${Number(product.oldPrice).toFixed(2)}</p>
                )}
              </div>

              <div className="flex flex-wrap gap-3 mb-6">
                {product.brand && (
                  <span className="px-3 py-1.5 rounded-full bg-zinc-100 text-zinc-700 text-[10px] font-black uppercase tracking-[0.2em]">
                    {product.brand}
                  </span>
                )}
                {product.categoryName && (
                  <span className="px-3 py-1.5 rounded-full bg-primary-container/10 text-primary-container text-[10px] font-black uppercase tracking-[0.2em]">
                    {product.categoryName}
                  </span>
                )}
                {product.skuCode && (
                  <span className="px-3 py-1.5 rounded-full bg-zinc-100 text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">
                    {product.skuCode}
                  </span>
                )}
              </div>

              <p className="text-zinc-500 mb-8 leading-relaxed">
                {product.description || "Engineered for ultra-motion. Designed for those who demand precision and speed on every surface."}
              </p>

              <div className="mb-8">
                <p className="text-label-md font-bold text-zinc-900 mb-4 uppercase tracking-widest">Color: <span className="text-zinc-400 font-normal">{selectedColor}</span></p>
                <div className="flex gap-4">
                  {product.colors?.map((c, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setSelectedColor(c);
                        // Heuristic: If we have multiple images, try to switch to the one matching the color index
                        if (thumbnails[i]) setMainImage(thumbnails[i]);
                      }}
                      className={`w-10 h-10 rounded-full border-2 p-0.5 transition-all duration-300 ${selectedColor === c ? 'border-primary-container scale-125 shadow-lg' : 'border-zinc-200 hover:border-zinc-400'}`}
                    >
                      <div className="w-full h-full rounded-full" style={{ backgroundColor: c }}></div>
                    </button>
                  ))}
                  {(!product.colors || product.colors.length === 0) && <p className="text-zinc-400 text-xs italic">Standard Edition</p>}
                </div>
              </div>

              <div className="mb-10">
                <div className="flex justify-between items-center mb-4">
                  <p className="text-label-md font-bold text-zinc-900 uppercase tracking-widest">Select Size</p>
                  <button className="text-xs font-bold text-primary-container hover:underline uppercase">Size Guide</button>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {product.sizes?.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(`US ${Number(s)}`)}
                      className={`py-3 rounded-xl border-2 font-bold transition-all ${selectedSize === `US ${Number(s)}` ? 'border-primary-container bg-primary-container/5 text-primary-container' : 'border-zinc-100 text-zinc-500 hover:border-zinc-200'}`}
                    >
                      US {Number(s)}
                    </button>
                  ))}
                  {(!product.sizes || product.sizes.length === 0) && <p className="text-zinc-400 text-xs italic">One Size Fits All</p>}
                </div>
              </div>

              <div className="flex gap-4">
                <button
                    onClick={handleAddToCart}
                    className="flex-1 bg-primary-container text-white font-bold py-5 rounded-2xl shadow-[0_15px_30px_-5px_rgba(0,82,255,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 mb-8">
                  <span className="material-symbols-outlined">shopping_bag</span>
                  ADD TO BAG
                </button>
                <button 
                  onClick={handleWishlistToggle}
                  className={`w-16 h-[60px] rounded-2xl border-2 flex items-center justify-center transition-all ${isLiked ? 'border-red-100 bg-red-50 text-red-500 shadow-inner' : 'border-zinc-100 text-zinc-400 hover:border-zinc-200'}`}
                >
                  <span className={`material-symbols-outlined text-2xl ${isLiked ? 'fill-red-500' : ''}`}>favorite</span>
                </button>
              </div>
              {cartError && (
                <div className="mb-6 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
                  {cartError}
                </div>
              )}

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
                {
                  icon: 'texture',
                  title: product.foamTech || 'FOAM TECH',
                  desc: product.foamTech
                    ? 'Foam technology information loaded from the database.'
                    : 'No foam technology data available in the current record.'
                },
                {
                  icon: 'shield',
                  title: product.plateTech || 'PLATE TECH',
                  desc: product.plateTech
                    ? 'Plate technology information loaded from the database.'
                    : 'No plate technology data available in the current record.'
                },
                {
                  icon: 'bolt',
                  title: product.upperTech || 'UPPER TECH',
                  desc: product.upperTech
                    ? 'Upper technology information loaded from the database.'
                    : 'No upper technology data available in the current record.'
                }
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
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
              {relatedProducts.length === 0 && (
                <p className="col-span-full text-center text-zinc-400 italic">No similar products found.</p>
              )}
            </div>
          </div>
          {/* Customer Reviews */}
          <div className="border-t border-zinc-100 pt-24" id="reviews-section">
            <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-20">
              <div>
                <h2 className="text-label-sm font-black text-primary-container uppercase tracking-[0.3em] mb-8">Customer Reviews</h2>
                <div className="flex items-end gap-6">
                  <p className="text-7xl font-black font-space-grotesk text-zinc-900 leading-none italic">
                    {reviews.length > 0 ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1) : "0.0"}
                  </p>
                  <div className="mb-1">
                    <div className="flex text-amber-500 mb-2">
                      {[...Array(5)].map((_, j) => <span key={j} className="material-symbols-outlined fill-amber-500 text-sm">star</span>)}
                    </div>
                    <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest">Based on {reviews.length} reviews</p>
                  </div>
                </div>
              </div>
              {isLoggedIn ? (
                hasPurchased ? (
                  <button 
                    onClick={handleWriteReviewClick}
                    className="bg-primary-container text-white px-8 py-4 rounded-xl font-bold flex items-center gap-3 shadow-lg hover:scale-105 transition-all uppercase tracking-wider text-xs"
                  >
                    <span className="material-symbols-outlined">edit</span>
                    {showReviewForm ? "Ẩn Form Đánh giá" : "Viết Đánh giá"}
                  </button>
                ) : (
                  <div className="flex items-center gap-2 bg-amber-50 text-amber-800 border border-amber-200/50 rounded-2xl px-6 py-4">
                    <span className="material-symbols-outlined text-amber-600 text-sm">lock</span>
                    <span className="text-xs font-bold uppercase tracking-wider">Chỉ khách hàng đã mua sản phẩm mới có thể đánh giá</span>
                  </div>
                )
              ) : (
                <button 
                  onClick={handleWriteReviewClick}
                  className="bg-zinc-100 text-zinc-400 px-8 py-4 rounded-xl font-bold flex items-center gap-3 cursor-not-allowed uppercase tracking-wider text-xs"
                >
                  <span className="material-symbols-outlined text-sm">lock</span>
                  Đăng nhập để đánh giá
                </button>
              )}
            </div>

            {/* Write Review Form */}
            {showReviewForm && (
              <div className="bg-zinc-50 border border-zinc-100 rounded-[32px] p-8 mb-12 animate-fade-in">
                <h3 className="text-lg font-black font-space-grotesk text-zinc-900 uppercase italic mb-6">Đánh giá của bạn</h3>
                <form onSubmit={handleCommentSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-zinc-400 mb-2">Tiêu đề đánh giá</label>
                      <input
                        type="text"
                        required
                        value={reviewTitle}
                        onChange={(e) => setReviewTitle(e.target.value)}
                        placeholder="Ví dụ: Giày rất êm, ôm chân!"
                        className="w-full bg-white border border-zinc-100 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-primary-container transition-all font-bold text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-zinc-400 mb-2">Đánh giá sao ({reviewRating} sao)</label>
                      <select
                        value={reviewRating}
                        onChange={(e) => setReviewRating(parseInt(e.target.value))}
                        className="w-full bg-white border border-zinc-100 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-primary-container transition-all font-bold text-sm"
                      >
                        <option value="5">⭐⭐⭐⭐⭐ 5 Sao - Tuyệt hảo</option>
                        <option value="4">⭐⭐⭐⭐ 4 Sao - Rất tốt</option>
                        <option value="3">⭐⭐⭐ 3 Sao - Bình thường</option>
                        <option value="2">⭐⭐ 2 Sao - Tạm ổn</option>
                        <option value="1">⭐ 1 Sao - Kém</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-zinc-400 mb-2">Nội dung bình luận</label>
                    <textarea
                      required
                      rows="4"
                      value={reviewContent}
                      onChange={(e) => setReviewContent(e.target.value)}
                      placeholder="Chia sẻ trải nghiệm thực tế của bạn khi đi đôi giày này..."
                      className="w-full bg-white border border-zinc-100 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-primary-container transition-all font-bold text-sm"
                    />
                  </div>

                  {/* Optional Photo Attachment */}
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-zinc-400 mb-2">Ảnh thực tế đính kèm (Không bắt buộc)</label>
                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="text-xs text-zinc-500 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-xs file:font-black file:uppercase file:bg-zinc-900 file:text-white hover:file:bg-zinc-800 file:cursor-pointer"
                      />
                      {reviewImage && (
                        <div className="w-20 h-20 bg-white border border-zinc-100 rounded-xl overflow-hidden p-1 relative">
                          <img src={reviewImage} alt="Preview" className="w-full h-full object-contain" />
                          <button
                            type="button"
                            onClick={() => setReviewImage('')}
                            className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold"
                          >
                            ×
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-primary-container text-white px-8 py-4 rounded-xl font-bold flex items-center gap-3 shadow-lg hover:scale-105 active:scale-[0.98] transition-all uppercase tracking-wider text-xs"
                  >
                    <span className="material-symbols-outlined">send</span>
                    {submitting ? "Đang gửi..." : "Gửi Đánh giá Của Bạn"}
                  </button>
                </form>
              </div>
            )}

            {/* Reviews List */}
            <div className="space-y-12">
              {reviews.map((rev) => (
                <div key={rev.id} className="border-b border-zinc-50 pb-12">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex text-amber-500 gap-0.5">
                      {[...Array(rev.rating)].map((_, j) => <span key={j} className="material-symbols-outlined text-sm fill-amber-500">star</span>)}
                      {[...Array(5 - rev.rating)].map((_, j) => <span key={j} className="material-symbols-outlined text-sm text-zinc-200">star</span>)}
                    </div>
                    <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest">{rev.date}</span>
                  </div>
                  <h4 className="font-bold text-zinc-900 text-lg mb-4">{rev.title}</h4>

                  {/* Layout content with photo */}
                  <div className="flex flex-col md:flex-row gap-6 mb-6">
                    {rev.image && (
                      <div className="w-32 h-32 bg-zinc-50 border border-zinc-100 rounded-2xl overflow-hidden p-1 shrink-0">
                        <img src={rev.image} alt="Review attachment" className="w-full h-full object-contain" />
                      </div>
                    )}
                    <p className="text-zinc-500 leading-relaxed self-center">{rev.content}</p>
                  </div>

                  {/* Verification Badge */}
                  <div className="flex items-center gap-2 mb-6">
                    <span className="text-zinc-950 font-black text-xs uppercase">{rev.name}</span>
                    <span className="w-1 h-1 bg-zinc-200 rounded-full"></span>
                    <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px] text-green-500">verified</span>
                      Đã mua sản phẩm này
                    </span>
                  </div>

                  {/* Nested Admin Replies */}
                  {rev.replies && rev.replies.map((reply, idx) => (
                    <div key={idx} className="bg-zinc-50 rounded-2xl p-5 border border-zinc-100 ml-6 md:ml-12 mt-4 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-primary-container uppercase tracking-widest flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">chat_bubble</span>
                          Phản hồi từ Ban quản trị
                        </span>
                        <span className="text-zinc-400 text-[9px] font-bold uppercase tracking-widest">{reply.date}</span>
                      </div>
                      <p className="text-xs text-zinc-600 leading-relaxed">{reply.content}</p>
                    </div>
                  ))}
                </div>
              ))}

              {reviews.length === 0 && (
                <div className="text-center py-16 bg-zinc-50 rounded-3xl border border-zinc-100">
                  <span className="material-symbols-outlined text-4xl text-zinc-300 mb-2 block">forum</span>
                  <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest">Chưa có đánh giá nào cho sản phẩm này.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetailPage;
