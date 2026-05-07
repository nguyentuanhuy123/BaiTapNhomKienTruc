import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import CartItem from "../components/cart/CartItem";
import OrderSummary from "../components/cart/OrderSummary";
import { cartService } from "../services/cartService";

// Placeholder data vì backend cart response chưa có price/image/variant/size
const PLACEHOLDER_IMAGE =
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/480px-No_image_available.svg.png";

const CartPage = () => {
  const [loading, setLoading] = useState(true);
  const [cartResponse, setCartResponse] = useState(null);
  const [error, setError] = useState("");

  const authErrorMessage = "Vui long dang nhap de su dung gio hang.";
  const isAuthError = (e) => [401, 403].includes(e?.response?.status);

  const readLocalCart = () => {
    try {
      const raw = localStorage.getItem("cart");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  const writeLocalCart = (cart) => {
    localStorage.setItem("cart", JSON.stringify(cart));
  };

  const [localCart, setLocalCart] = useState(() => readLocalCart());
  const hasLocalCart = !!localCart?.items?.length;

  const cartItems = useMemo(() => {
    if (localCart?.items?.length) {
      return localCart.items.map((it) => ({
        id: it.id,
        backendItemId: it.backendItemId ?? null,
        name: it.name || it.skuCode,
        variant: it.color || "Default",
        size: it.size || "N/A",
        price: it.price || 0,
        quantity: it.quantity ?? 0,
        image: it.image || PLACEHOLDER_IMAGE,
      }));
    }

    const items = cartResponse?.items || [];
    return items.map((it) => ({
      id: it.id,
      backendItemId: null,
      name: it.name || it.skuCode,
      variant: it.color || "Default",
      size: it.size || "N/A",
      price: it.price || 0,
      quantity: it.quantity ?? 0,
      image: it.image || PLACEHOLDER_IMAGE,
    }));
  }, [localCart, cartResponse]);


  const fetchCart = async () => {
    if (hasLocalCart) {
      setLoading(false);
      return;
    }
    try {
      setError("");
      setLoading(true);
      const data = await cartService.getCart();
      setCartResponse(data);
      if (data?.items?.length) {
        const nextLocalCart = {
          items: data.items.map((it) => ({
            id: `local-${it.id ?? "item"}-${it.size || "N-A"}-${it.color || "N-A"}`,
            backendItemId: it.id ?? null,
            productId: it.productId ?? null,
            skuCode: it.skuCode,
            name: it.name || it.skuCode,
            price: it.price || 0,
            image: it.image || PLACEHOLDER_IMAGE,
            size: it.size || "N/A",
            color: it.color || "Default",
            quantity: it.quantity ?? 0,
          })),
          updatedAt: new Date().toISOString(),
        };
        writeLocalCart(nextLocalCart);
        setLocalCart(nextLocalCart);
      }
    } catch (e) {
      console.error(e);
      if (isAuthError(e)) {
        setError(authErrorMessage);
      } else {
        setError("Failed to load cart. Please make sure API Gateway + Eureka + Order Service are running.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateQuantity = async (itemId, delta) => {
    if (hasLocalCart) {
      const nextCart = { ...localCart };
      const items = Array.isArray(nextCart.items) ? [...nextCart.items] : [];
      const index = items.findIndex(
        (x) => (x.backendItemId ?? x.id) === itemId
      );
      if (index < 0) return;

      const current = items[index];
      const nextQty = (current.quantity ?? 0) + delta;

      if (current.backendItemId != null) {
        try {
          await cartService.updateQuantity({
             itemId: current.backendItemId,
             quantity: nextQty,
           });
        } catch (e) {
          console.error(e);
          setError(isAuthError(e) ? authErrorMessage : "Failed to update quantity.");
          return;
        }
      }

      if (nextQty <= 0) {
        items.splice(index, 1);
      } else {
        items[index] = { ...current, quantity: nextQty };
      }

      nextCart.items = items;
      nextCart.updatedAt = new Date().toISOString();
      writeLocalCart(nextCart);
      setLocalCart(nextCart);
      return;
    }

    // optimistic: tìm qty hiện tại
    const current = cartResponse?.items?.find((x) => x.id === itemId);
    if (!current) return;

    const nextQty = (current.quantity ?? 0) + delta;

    try {
      setError("");
      // Backend: quantity <= 0 sẽ tự xoá item (theo logic bạn)
      const updated = await cartService.updateQuantity({
         itemId,
         quantity: nextQty,
       });
      setCartResponse(updated);
    } catch (e) {
      console.error(e);
      setError(isAuthError(e) ? authErrorMessage : "Failed to update quantity.");
    }
  };

  const removeItem = async (itemId) => {
    if (hasLocalCart) {
      const nextCart = { ...localCart };
      const items = Array.isArray(nextCart.items) ? [...nextCart.items] : [];
      const index = items.findIndex(
        (x) => (x.backendItemId ?? x.id) === itemId
      );
      if (index < 0) return;

      const current = items[index];
      if (current.backendItemId != null) {
        try {
          await cartService.removeItem({ itemId: current.backendItemId });
        } catch (e) {
          console.error(e);
          setError(isAuthError(e) ? authErrorMessage : "Failed to remove item.");
          return;
        }
      }

      items.splice(index, 1);
      nextCart.items = items;
      nextCart.updatedAt = new Date().toISOString();
      writeLocalCart(nextCart);
      setLocalCart(nextCart);
      return;
    }

    try {
      setError("");
      const updated = await cartService.removeItem({ itemId });
      setCartResponse(updated);
    } catch (e) {
      console.error(e);
      setError(isAuthError(e) ? authErrorMessage : "Failed to remove item.");
    }
  };

  // Summary (tạm: price=0 nên subtotal/total sẽ = shipping+tax...)
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shipping = cartItems.length > 0 ? 0.0 : 0.0;
  const tax = cartItems.length > 0 ? 10.0 : 0.0;
  const total = subtotal + shipping + tax;

  return (
      <div className="flex flex-col min-h-screen bg-white">
        <Navbar />

        <main className="flex-1 pt-24 pb-20 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto w-full">
          <div className="flex flex-col lg:flex-row gap-16">
            <div className="flex-1">
              <div className="flex justify-between items-end mb-10">
                <h1 className="text-headline-xl font-space-grotesk font-black text-zinc-900 uppercase italic tracking-tighter">
                  Your Bag
                </h1>
                <p className="text-zinc-400 font-bold uppercase text-xs tracking-widest">
                  {cartItems.length} Items
                </p>
              </div>

              {error && (
                  <div className="mb-6 p-4 rounded-2xl bg-red-50 text-red-700 text-sm">
                    {error}
                  </div>
              )}

              {loading ? (
                  <div className="space-y-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-40 bg-zinc-100 animate-pulse rounded-3xl" />
                    ))}
                  </div>
              ) : cartItems.length > 0 ? (
                  <div className="space-y-8">
                    {cartItems.map((item) => (
                        <CartItem
                            key={item.id}
                            item={item}
                            onUpdateQuantity={updateQuantity}
                            onRemove={removeItem}
                        />
                    ))}
                  </div>
              ) : (
                  <div className="py-20 text-center bg-zinc-50 rounded-[40px]">
                <span className="material-symbols-outlined text-6xl text-zinc-200 mb-6 block">
                  shopping_bag
                </span>
                    <p className="text-zinc-500 mb-8">Your bag is currently empty.</p>
                    <Link to="/explore">
                      <button className="bg-primary-container text-white px-8 py-4 rounded-full font-bold shadow-lg hover:scale-105 transition-all">
                        Start Shopping
                      </button>
                    </Link>
                  </div>
              )}
            </div>

            <div className="lg:w-[400px]">
              <OrderSummary subtotal={subtotal} shipping={shipping} tax={tax} total={total} />
            </div>
          </div>
        </main>

        <Footer />
      </div>
  );
};

export default CartPage;
