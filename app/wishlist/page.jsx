"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Heart, ShoppingBag, Trash2, ArrowLeft, Sparkles, Eye, Tag, UserCheck, Layers, Star } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // =========================
  // FETCH WISHLIST PRODUCTS
  // =========================
  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/wishlist", {
        withCredentials: true,
      });

      if (response.data.success) {
        const items = (response.data.wishlist || []).map((item) =>
          item.product ? item.product : item
        );
        setWishlistItems(items);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        router.push("/auth");
      } else {
        setWishlistItems([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  // =========================
  // REMOVE FROM WISHLIST
  // =========================
  const handleRemoveFromWishlist = async (productId) => {
    try {
      const response = await axios.post(
        "/api/wishlist",
        { productId },
        { withCredentials: true }
      );

      if (response.data.success) {
        setWishlistItems((prev) =>
          prev.filter((item) => item._id !== productId)
        );

        window.dispatchEvent(new Event("wishlistUpdated"));
      }
    } catch (error) {
      console.error("Error removing from wishlist:", error);
    }
  };

  // =========================
  // ADD TO CART
  // =========================
  const handleAddToCart = async (product) => {
    try {
      const availableSizes = Array.isArray(product.size)
        ? product.size
        : product.size ? String(product.size).split(",") : [];

      const availableColors = Array.isArray(product.colors)
        ? product.colors
        : product.colors ? String(product.colors).split(",") : [];

      const selectedSize = availableSizes.length ? availableSizes[0].trim() : "";
      const selectedColor = availableColors.length ? availableColors[0].trim() : "";

      const response = await axios.post(
        "/api/cart",
        {
          productId: product._id,
          quantity: 1,
          size: selectedSize,
          color: selectedColor,
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        alert(`${product.name} added to cart successfully!`);
        window.dispatchEvent(new Event("cartUpdated"));
      }
    } catch (error) {
      if (error.response?.status === 401) {
        router.push("/auth");
      } else {
        alert(error.response?.data?.message || "Unable to add product to cart.");
      }
    }
  };

  // PRODUCT IMAGE HELPER
  const getProductImage = (product) => {
    if (product.images?.length > 0) {
      return product.images[0];
    }
    if (product.image) {
      return product.image;
    }
    return "/hero_img/hero-watch.jpg";
  };

  return (
    <>
      <style jsx global>{`
        /* Golden Blinking Card Border */
        @keyframes goldBorderBlink {
          0%, 100% {
            border-color: rgba(234, 179, 8, 0.85);
            box-shadow: 0 0 18px rgba(234, 179, 8, 0.35), 0 8px 25px rgba(0, 0, 0, 0.4);
          }
          50% {
            border-color: rgba(234, 179, 8, 0.25);
            box-shadow: 0 0 6px rgba(234, 179, 8, 0.1), 0 8px 25px rgba(0, 0, 0, 0.4);
          }
        }

        /* Gold Price Tag Blinking Animation */
        @keyframes goldPriceBlink {
          0%, 100% {
            background-color: #eab308;
            color: #000000;
            box-shadow: 0 0 18px rgba(234, 179, 8, 0.9);
          }
          50% {
            background-color: #ca8a04;
            color: #ffffff;
            box-shadow: 0 0 6px rgba(202, 138, 4, 0.4);
          }
        }

        .gold-blink-card {
          animation: goldBorderBlink 2.5s infinite ease-in-out;
        }

        .gold-price-blink {
          animation: goldPriceBlink 1.8s infinite ease-in-out;
        }

        /* 3D Flip Effect setup */
        .perspective-1000 {
          perspective: 1000px;
        }
        
        .flip-card-inner {
          transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
          transform-style: preserve-3d;
        }

        .group:hover .flip-card-inner {
          transform: rotateY(180deg);
        }

        .flip-card-front, .flip-card-back {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }

        .flip-card-back {
          transform: rotateY(180deg);
        }
      `}</style>

      <main className="min-h-screen bg-[#0a0b0e] text-white">
        <Navbar />

        {/* Added extra top margin (pt-16 md:pt-24) here */}
        <div className="mx-auto max-w-7xl px-6 pt-16 pb-14 md:px-12 md:pt-24">
          
          {/* Navigation / Header */}
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Link
                href="/shop"
                className="mb-3 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-400 transition hover:text-amber-300"
              >
                <ArrowLeft size={16} />
                Continue Shopping
              </Link>
              <h1 className="font-serif text-4xl font-bold tracking-tight text-white md:text-5xl">
                My Wishlist
              </h1>
              <p className="mt-2 text-sm text-gray-400">
                {wishlistItems.length}{" "}
                {wishlistItems.length === 1 ? "saved watch" : "saved watches"} in your private collection
              </p>
            </div>
          </div>

          {/* Skeleton Loader */}
          {loading ? (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className="h-[350px] animate-pulse rounded-[24px] bg-[#161a23] border border-white/10"
                />
              ))}
            </div>
          ) : wishlistItems.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center rounded-[32px] border border-amber-400/20 bg-[#12151d] px-6 py-24 text-center shadow-2xl">
              <div className="flex h-20 w-20 items-center justify-center rounded-full border border-amber-400/30 bg-amber-400/10 text-amber-400 shadow-[0_0_20px_rgba(234,179,8,0.2)]">
                <Heart size={36} />
              </div>
              <h2 className="mt-6 font-serif text-2xl font-bold text-white">
                Your Wishlist is Empty
              </h2>
              <p className="mt-2 max-w-md text-sm text-gray-400">
                Explore our master-crafted luxury timepieces and tap the heart icon on any watch to save your favorites here.
              </p>
              <Link
                href="/shop"
                className="mt-8 flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 px-8 py-3.5 text-xs font-extrabold uppercase tracking-widest text-black shadow-lg shadow-amber-500/20 transition duration-200 hover:from-amber-400 hover:to-yellow-500"
              >
                <Sparkles size={16} />
                Explore Watches
              </Link>
            </div>
          ) : (
            /* Wishlist Items Grid */
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {wishlistItems.map((product) => {
                const productImage = getProductImage(product);
                const secondImage =
                  product.images?.length > 1
                    ? product.images[1]
                    : productImage;

                const offerPrice =
                  product.offerPrice ?? product.discountPrice ?? product.price;

                const originalPrice =
                  product.originalPrice ?? product.mrp ?? (product.offerPrice ? product.price : null);

                const hasDiscount =
                  originalPrice && Number(originalPrice) > Number(offerPrice);

                const categoryName =
                  product.category?.name || product.category || "Luxury Watch";

                const genderTag = product.gender || "Unisex";

                const colorsList = Array.isArray(product.colors)
                  ? product.colors
                  : product.colors
                  ? String(product.colors).split(",").map(c => c.trim()).filter(Boolean)
                  : [];

                return (
                  <article
                    key={product._id}
                    className="gold-blink-card group relative flex flex-col overflow-hidden rounded-[24px] bg-[#12151d] text-white border-2 transition-all duration-500 hover:-translate-y-2"
                  >
                    {/* REDUCED TOP 3D FLIP IMAGE CONTAINER HEIGHT (h-[210px]) */}
                    <div className="perspective-1000 relative h-[210px] w-full overflow-hidden bg-gradient-to-b from-[#161a24] via-[#0e2136] to-[#060911]">
                      
                      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(234,179,8,0.15)_0%,transparent_70%)]" />

                      {/* Animated Flip Wrapper */}
                      <Link
                        href={`/shop/${product._id}`}
                        className="absolute inset-0 block p-3"
                      >
                        <div className="flip-card-inner relative h-full w-full">
                          {/* Front Image */}
                          <div className="flip-card-front absolute inset-0 flex items-center justify-center">
                            <img
                              src={productImage}
                              alt={product.name}
                              className="h-full w-full object-contain drop-shadow-[0_12px_15px_rgba(0,0,0,0.7)]"
                            />
                          </div>

                          {/* Back Flip Image */}
                          <div className="flip-card-back absolute inset-0 flex items-center justify-center">
                            <img
                              src={secondImage}
                              alt={`${product.name} preview`}
                              className="h-full w-full object-contain drop-shadow-[0_12px_15px_rgba(0,0,0,0.7)]"
                            />
                          </div>
                        </div>
                      </Link>

                      {/* GOLDEN BLINKING PRICE BADGE */}
                      <div className="gold-price-blink absolute right-3 top-3 z-10 flex flex-col items-end rounded-xl px-2.5 py-1 transition-all">
                        <span className="text-xs font-black tracking-tight leading-none">
                          ₹{Number(offerPrice).toLocaleString("en-IN")}
                        </span>
                        {hasDiscount && (
                          <span className="mt-0.5 text-[9px] font-bold line-through opacity-80 leading-none">
                            ₹{Number(originalPrice).toLocaleString("en-IN")}
                          </span>
                        )}
                      </div>

                      {/* REMOVE / DELETE BUTTON */}
                      <button
                        type="button"
                        onClick={() => handleRemoveFromWishlist(product._id)}
                        title="Remove from wishlist"
                        aria-label="Remove item"
                        className="absolute left-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-red-500/40 bg-black/60 text-red-400 shadow-lg backdrop-blur-md transition-all duration-300 hover:scale-110 hover:border-red-500 hover:bg-red-500 hover:text-white active:scale-90"
                      >
                        <Trash2 size={15} strokeWidth={1.8} />
                      </button>

                      {/* STOCK STATUS BADGE */}
                      <div className="absolute bottom-2.5 left-3 z-10 flex items-center gap-1.5">
                        {product.stock > 0 ? (
                          <span className="rounded-md bg-emerald-500/20 border border-emerald-500/50 backdrop-blur-md px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-300">
                            In Stock ({product.stock})
                          </span>
                        ) : (
                          <span className="rounded-md bg-red-600 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
                            Out of Stock
                          </span>
                        )}
                      </div>
                    </div>

                    {/* PRODUCT DETAILS AREA */}
                    <div className="flex flex-1 flex-col rounded-t-[20px] bg-[#161a23] p-4 -mt-3 relative z-10 border-t border-white/10">
                      
                      {/* CATEGORY & GENDER ROW */}
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-1">
                          <Tag size={12} className="text-amber-400" />
                          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                            {categoryName}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full text-[9px] font-semibold text-gray-300 uppercase">
                          <UserCheck size={10} className="text-amber-400" />
                          {genderTag}
                        </div>
                      </div>

                      {/* TITLE & BRAND */}
                      <Link href={`/shop/${product._id}`}>
                        <h2 className="font-serif text-base font-bold uppercase tracking-wide text-white transition-colors duration-300 hover:text-amber-300 line-clamp-1">
                          {product.name}
                        </h2>
                      </Link>

                      {product.brand && (
                        <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                          {product.brand}
                        </p>
                      )}

                      {/* DESCRIPTION */}
                      <p className="mt-1.5 text-[11px] text-gray-400 line-clamp-2 leading-relaxed">
                        {product.description || `${product.brand || "Time Aura"} premium timepiece built with luxury standards.`}
                      </p>

                      {/* COLOR OPTIONS PREVIEW */}
                      {colorsList.length > 0 && (
                        <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1">
                            <Layers size={10} className="text-amber-400" />
                            Colors:
                          </span>
                          <div className="flex items-center gap-1">
                            {colorsList.slice(0, 3).map((color, idx) => (
                              <span
                                key={idx}
                                title={color}
                                className="text-[9px] font-semibold bg-white/10 text-gray-200 border border-white/10 px-1 py-0.5 rounded"
                              >
                                {color}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* RATING STARS */}
                      <div className="mt-2.5 flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((starIndex) => (
                          <Star
                            key={starIndex}
                            size={12}
                            className={
                              starIndex <= Math.floor(product.rating || 4.5)
                                ? "fill-amber-400 text-amber-400"
                                : "fill-gray-600 text-gray-600"
                            }
                          />
                        ))}
                        <span className="ml-1 text-[10px] font-bold text-gray-400">
                          ({product.rating || "4.8"})
                        </span>
                      </div>

                      {/* ACTION BUTTONS AREA */}
                      <div className="mt-auto pt-3 flex items-center gap-2">
                        
                        {/* Cart Button */}
                        <button
                          type="button"
                          disabled={product.stock === 0}
                          onClick={() => handleAddToCart(product)}
                          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 py-2 text-[11px] font-extrabold uppercase tracking-wider text-black shadow-md shadow-amber-500/20 hover:from-amber-400 hover:to-yellow-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <ShoppingBag size={14} strokeWidth={2} />
                          {product.stock === 0 ? "Out" : "Add to Cart"}
                        </button>

                        {/* View Single Product Button */}
                        <Link
                          href={`/shop/${product._id}`}
                          className="flex items-center justify-center gap-1 rounded-xl border border-white/20 bg-white/5 px-2.5 py-2 text-[11px] font-bold uppercase tracking-wider text-white transition-all hover:border-amber-400 hover:bg-amber-400 hover:text-black"
                        >
                          <Eye size={14} />
                          View
                        </Link>

                      </div>

                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        <Footer />
      </main>
    </>
  );
}