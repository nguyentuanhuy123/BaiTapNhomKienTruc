import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import ProductCard from '../components/common/ProductCard';
import { productService } from '../services/productService';
import { useNavigate } from 'react-router-dom';
import { cartService } from '../services/cartService';


const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [mainImage, setMainImage] = useState("");
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isLiked, setIsLiked] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState({ content: '', rating: 5, username: '' });
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const getUserId = () => {
    // return Number(localStorage.getItem("userId")) || 123;
    return 123;
  };

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
        // 1. Fetch Core Product Info (Must succeed)
        try {
          const data = await productService.getProductById(id);
          if (data) {
            setProduct(data);
            
            // Set default selection
            if (data.sizes?.length > 0) setSelectedSize(`US ${data.sizes[0]}`);
            if (data.colors?.length > 0) setSelectedColor(data.colors[0]);
            if (data.imageResponses?.length > 0) setMainImage(data.imageResponses[0].url);
            else if (data.image) setMainImage(data.image);

            // Fetch related products (optional)
            productService.getAllProducts(0, 4, data.categoryName)
              .then(related => {
                if (related && related.content) {
                  setRelatedProducts(related.content.filter(p => p.id !== parseInt(id)).slice(0, 4));
                }
              }).catch(e => console.warn('Related products failed:', e));
          }
        } catch (e) {
          console.error('Failed to fetch core product info:', e);
          setProduct(null);
        }

        // 2. Secondary Info (Disabled temporarily for auth implementation)
        /* 
        productService.getCommentsByProduct(id).then(setComments);
        productService.isInWishlist('testuser', id).then(setIsLiked);
        */

      } catch (globalError) {
        console.error('Global fetch error:', globalError);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    window.scrollTo(0, 0);
  }, [id]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.content || !newComment.username) return;

    try {
      setSubmitting(true);
      const savedComment = await productService.addComment({
        ...newComment,
        productId: parseInt(id)
      });
      setComments([savedComment, ...comments]);
      setNewComment({ content: '', rating: 5, username: '' });
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleWishlistToggle = async () => {
    // Temporarily disabled API call for auth implementation
    /*
    try {
      await productService.toggleWishlist('testuser', id);
    } catch (error) {
      console.error('Failed to toggle wishlist:', error);
    }
    */
    setIsLiked(!isLiked); // Keep local UI working
  };


  const handleAddToCart = async () => {
    if (!product) return;

    const userId = getUserId();
    const skuCode = product.skuCode || `SKU-${product.id}`;

    try {
      // 1) Sync to backend cart
      const updated = await cartService.addItem({
        userId,
        skuCode,
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
          name: product.name,
          price: product.price || 0,
          image: product.imageResponses?.[0]?.url || product.image || "",
          size: selectedSize || "N/A",
          color: selectedColor || "N/A",
          quantity: 1,
        });
      }

      localCart.updatedAt = new Date().toISOString();
      writeLocalCart(localCart);

      // 3) Redirect to cart page
      navigate("/cart");
    } catch (error) {
      console.error("Failed to add to cart:", error);
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
                <p className="text-headline-md font-bold text-primary-container">${product.price?.toFixed(2)}</p>
                {product.oldPrice && (
                  <p className="text-zinc-400 line-through font-bold">${product.oldPrice.toFixed(2)}</p>
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
                      onClick={() => setSelectedSize(`US ${s}`)}
                      className={`py-3 rounded-xl border-2 font-bold transition-all ${selectedSize === `US ${s}` ? 'border-primary-container bg-primary-container/5 text-primary-container' : 'border-zinc-100 text-zinc-500 hover:border-zinc-200'}`}
                    >
                      US {s}
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
                { icon: 'weight', title: 'ULTRA-LIGHTWEIGHT', desc: 'At only 180g, the X1 is engineered to disappear on your feet, allowing for explosive speed without the drag.' },
                { icon: 'texture', title: 'AERO-KNIT TECH', desc: 'Multi-layered knit construction ensures maximum airflow where you need it most during intense performance.' },
                { icon: 'bolt', title: 'ENERGY RETURN', desc: 'Our proprietary foam tech recovers 94% of energy on every stride, propelling you forward with less effort.' }
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
          <div className="border-t border-zinc-100 pt-24">
            <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-20">
              <div>
                <h2 className="text-label-sm font-black text-primary-container uppercase tracking-[0.3em] mb-8">Customer Reviews</h2>
                <div className="flex items-end gap-6">
                  <p className="text-7xl font-black font-space-grotesk text-zinc-900 leading-none italic">4.8</p>
                  <div className="mb-1">
                    <div className="flex text-primary-container mb-2">
                      {[...Array(5)].map((_, j) => <span key={j} className="material-symbols-outlined">star</span>)}
                    </div>
                    <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest">Based on 124 reviews</p>
                  </div>
                </div>
              </div>
              <button className="bg-primary-container text-white px-8 py-4 rounded-xl font-bold flex items-center gap-3 shadow-lg hover:scale-105 transition-all">
                <span className="material-symbols-outlined">edit</span>
                WRITE A REVIEW
              </button>
            </div>

            <div className="space-y-12">
              {[
                { title: "ULTIMATE ROAD COMPANION", date: "OCT 12, 2023", name: "MICHAEL R.", content: "The responsiveness of the carbon midsole is a game changer for my training intervals. Transition from mid-foot to toe-off feels incredibly natural and snappy." },
                { title: "LIGHT AS A FEATHER", date: "OCT 05, 2023", name: "ELENA B.", content: "I was skeptical about the 180g claim until I put them on. It's like wearing socks with extreme propulsion. Highly recommend for competitive runners." }
              ].map((rev, i) => (
                <div key={i} className="border-b border-zinc-50 pb-12">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex text-primary-container">
                      {[...Array(5)].map((_, j) => <span key={j} className="material-symbols-outlined text-sm">star</span>)}
                    </div>
                    <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest">{rev.date}</span>
                  </div>
                  <h4 className="font-bold text-zinc-900 text-lg mb-4">{rev.title}</h4>
                  <p className="text-zinc-500 leading-relaxed mb-6">{rev.content}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-900 font-black text-xs uppercase">{rev.name}</span>
                    <span className="w-1 h-1 bg-zinc-200 rounded-full"></span>
                    <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px] text-green-500">verified</span>
                      Verified Buyer
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-16">
              <button className="text-primary-container font-black text-xs uppercase tracking-[0.2em] border-b-2 border-primary-container pb-1 hover:text-blue-700 hover:border-blue-700 transition-all">
                Load More Reviews
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetailPage;
