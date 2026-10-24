"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import {
  Minus,
  Plus,
  Trash2,
  ArrowLeft,
  ShoppingBag,
} from "lucide-react";

export default function CartPage() {
  const router = useRouter();

  // STATES
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  // GET PRODUCT PRICE
  const getPrice = (product) => {
    if (!product) return 0;
    return Number(
      product.offerPrice ??
        product.price ??
        product.mrp ??
        0
    );
  };

  // FETCH CART
  const fetchCart = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axios.get("/api/cart", {
        withCredentials: true,
      });

      if (res.data.success) {
        setCartItems(res.data.items || []);
      }
    } catch (error) {
      console.error(
        "Fetch cart error:",
        error.response?.data || error.message
      );

      if (error.response?.status === 401) {
        router.push("/auth");
        return;
      }

      setError(
        error.response?.data?.message ||
          "Unable to load cart"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // UPDATE QUANTITY
  const updateQuantity = async (item, newQuantity) => {
    if (newQuantity < 1 || !item?._id) return;

    setUpdatingId(item._id);
    setMessage("");
    setError("");

    try {
      const res = await axios.put(
        "/api/cart",
        {
          cartItemId: item._id,
          quantity: newQuantity,
        },
        { withCredentials: true }
      );

      if (res.data.success) {
        setCartItems(res.data.items || []);
        window.dispatchEvent(new Event("cartUpdated"));
      }
    } catch (error) {
      console.error(
        "Update quantity error:",
        error.response?.data || error.message
      );

      if (error.response?.status === 401) {
        router.push("/auth");
        return;
      }

      setError(
        error.response?.data?.message ||
          "Unable to update quantity"
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // REMOVE CART ITEM
  const removeItem = async (cartItemId) => {
    if (!cartItemId) return;

    setUpdatingId(cartItemId);
    setMessage("");
    setError("");

    try {
      const res = await axios.delete("/api/cart", {
        data: { cartItemId },
        withCredentials: true,
      });

      if (res.data.success) {
        setCartItems(res.data.items || []);
        window.dispatchEvent(new Event("cartUpdated"));
      }
    } catch (error) {
      console.error(
        "Remove cart item error:",
        error.response?.data || error.message
      );

      if (error.response?.status === 401) {
        router.push("/auth");
        return;
      }

      setError(
        error.response?.data?.message ||
          "Unable to remove product"
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // SUBTOTAL
  const subtotal = cartItems.reduce((total, item) => {
    const product = item.product;
    const price = getPrice(product);
    const quantity = Number(item.quantity || 0);
    return total + price * quantity;
  }, 0);

  // TOTAL QUANTITY
  const totalQuantity = cartItems.reduce((total, item) => {
    return total + Number(item.quantity || 0);
  }, 0);

  // LOADING UI
  if (loading) {
    return (
      <main className="min-h-screen bg-[#0e1015] px-6 py-32 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-amber-400 font-bold uppercase tracking-widest">
            Loading your shopping bag...
          </p>
        </div>
      </main>
    );
  }

  // EMPTY CART
  if (cartItems.length === 0) {
    return (
      <main className="min-h-screen bg-[#0e1015] px-6 py-32 text-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-center text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-[#141720] border border-amber-400/35 shadow-xl">
            <ShoppingBag
              size={32}
              strokeWidth={1.5}
              className="text-amber-400"
            />
          </div>

          <h1 className="mt-6 text-3xl font-serif font-bold text-white">
            Your Cart is Empty
          </h1>

          <p className="mt-3 max-w-md text-sm text-gray-400">
            You haven't added any luxury timepieces to your cart yet.
          </p>

          <Link
            href="/shop"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 px-8 py-3.5 text-xs font-black uppercase tracking-[0.2em] text-black shadow-lg shadow-amber-500/20 hover:scale-105 transition-all"
          >
            <ArrowLeft size={16} />
            Explore Collection
          </Link>
        </div>
      </main>
    );
  }

  return (
    <>
      <style jsx global>{`
        @keyframes borderBlink {
          0%, 100% {
            border-color: rgba(234, 179, 8, 0.7);
            box-shadow: 0 0 15px rgba(234, 179, 8, 0.25);
          }
          50% {
            border-color: rgba(234, 179, 8, 0.2);
            box-shadow: 0 0 5px rgba(234, 179, 8, 0.1);
          }
        }
        .gold-blink-box {
          animation: borderBlink 2.5s infinite ease-in-out;
        }
      `}</style>

      <main className="min-h-screen bg-[#0e1015] px-6 pb-20 pt-32 text-white">
        <div className="mx-auto max-w-7xl">
          {/* HEADER */}
          <div className="mb-10">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-400">
              Shopping Bag
            </p>

            <h1 className="mt-3 text-4xl font-serif font-bold tracking-tight text-white">
              Your Cart
            </h1>

            <p className="mt-2 text-sm text-gray-400">
              {cartItems.length}{" "}
              {cartItems.length === 1 ? "product" : "products"} ·{" "}
              {totalQuantity} {totalQuantity === 1 ? "item" : "items"}
            </p>
          </div>

          {/* MESSAGES */}
          {message && (
            <div className="mb-6 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-300">
              {message}
            </div>
          )}

          {error && (
            <div className="mb-6 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-300">
              {error}
            </div>
          )}

          {/* CONTENT GRID */}
          <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
            {/* CART ITEMS */}
            <div className="space-y-4">
              {cartItems.map((item) => {
                const product = item.product;
                if (!product) return null;

                const price = getPrice(product);
                const quantity = Number(item.quantity || 0);
                const itemTotal = price * quantity;
                const image =
                  product.images?.[0] ||
                  product.image ||
                  "/hero_img/hero-watch.jpg";

                return (
                  <div
                    key={item._id}
                    className="gold-blink-box rounded-2xl bg-[#141720] border-2 p-5 shadow-xl transition-all"
                  >
                    <div className="flex gap-5">
                      {/* PRODUCT IMAGE */}
                      <div className="h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-[#161a23] border border-white/10 flex items-center justify-center p-2">
                        <img
                          src={image}
                          alt={product.name || "Watch"}
                          className="h-full w-full object-contain"
                        />
                      </div>

                      {/* PRODUCT DETAILS */}
                      <div className="flex min-w-0 flex-1 flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                                {product.brand || "Time Aura"}
                              </p>
                              <h2 className="mt-1 text-base sm:text-lg font-serif font-bold text-white">
                                {product.name}
                              </h2>
                            </div>

                            {/* DELETE BUTTON */}
                            <button
                              type="button"
                              onClick={() => removeItem(item._id)}
                              disabled={updatingId === item._id}
                              aria-label="Remove product"
                              className="text-gray-400 transition hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-40 p-1.5 rounded-lg hover:bg-white/5"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>

                          {/* SIZE & COLOR */}
                          {item.size && (
                            <p className="mt-1.5 text-xs text-gray-400">
                              Size:{" "}
                              <span className="font-bold text-gray-200">
                                {item.size}
                              </span>
                            </p>
                          )}
                          {item.color && (
                            <p className="mt-0.5 text-xs text-gray-400">
                              Color:{" "}
                              <span className="font-bold text-gray-200">
                                {item.color}
                              </span>
                            </p>
                          )}
                        </div>

                        {/* QUANTITY & PRICE */}
                        <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
                          <div className="flex items-center rounded-xl border border-white/15 bg-white/5">
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(item, quantity - 1)
                              }
                              disabled={
                                updatingId === item._id || quantity <= 1
                              }
                              aria-label="Decrease quantity"
                              className="flex h-8 w-8 items-center justify-center text-gray-300 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                            >
                              <Minus size={14} />
                            </button>

                            <span className="w-8 text-center text-xs font-bold text-amber-400">
                              {quantity}
                            </span>

                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(item, quantity + 1)
                              }
                              disabled={updatingId === item._id}
                              aria-label="Increase quantity"
                              className="flex h-8 w-8 items-center justify-center text-gray-300 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                            >
                              <Plus size={14} />
                            </button>
                          </div>

                          <div className="text-right">
                            <p className="text-base sm:text-lg font-black text-amber-400">
                              ₹{itemTotal.toLocaleString("en-IN")}
                            </p>
                            {quantity > 1 && (
                              <p className="text-[10px] text-gray-400">
                                ₹{price.toLocaleString("en-IN")} each
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ORDER SUMMARY */}
            <div className="h-fit rounded-3xl bg-[#141720] border border-white/10 p-6 lg:sticky lg:top-28 shadow-xl">
              <h2 className="text-xl font-serif font-bold text-white border-b border-white/10 pb-4">
                Order Summary
              </h2>

              <div className="mt-6 flex items-center justify-between text-sm">
                <span className="text-gray-400">Subtotal</span>
                <span className="font-semibold text-white">
                  ₹{subtotal.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-gray-400">Shipping</span>
                <span className="font-bold text-emerald-400 uppercase text-xs tracking-wider">
                  Free
                </span>
              </div>

              <div className="my-6 border-t border-white/10" />

              <div className="flex items-center justify-between">
                <span className="text-base font-bold text-white">Total</span>
                <span className="text-2xl font-black text-amber-400">
                  ₹{subtotal.toLocaleString("en-IN")}
                </span>
              </div>

              <button
                type="button"
                onClick={() => router.push("/checkout")}
                className="mt-7 w-full rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 py-4 text-xs font-black uppercase tracking-[0.2em] text-black shadow-lg shadow-amber-500/25 transition-all"
              >
                Proceed to Checkout
              </button>

              <Link
                href="/shop"
                className="mt-4 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400 transition hover:text-amber-400"
              >
                <ArrowLeft size={15} />
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}