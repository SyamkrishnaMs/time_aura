"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, ShoppingBag, Eye, Tag, Star, UserCheck, Layers } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function ShopPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("All");
  const [wishlist, setWishlist] = useState([]);
  const [message, setMessage] = useState("");
  const [adVideo, setAdVideo] = useState("");
  const [adVideoLoading, setAdVideoLoading] = useState(true);

  // FETCH PRODUCTS
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/product");

        if (!res.ok) {
          throw new Error("Failed to fetch products");
        }

        const data = await res.json();
        setProducts(data.products || []);
      } catch (error) {
        console.error("ERROR FETCHING PRODUCTS:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // FETCH LANDING AD VIDEO
  useEffect(() => {
    const fetchLandingPage = async () => {
      try {
        const res = await fetch("/api/admin/landing");

        if (!res.ok) {
          throw new Error("Failed to fetch landing page");
        }

        const data = await res.json();
        setAdVideo(data.landingPage?.adVideo || "");
      } catch (error) {
        console.error("FETCH LANDING PAGE ERROR:", error);
        setAdVideo("");
      } finally {
        setAdVideoLoading(false);
      }
    };

    fetchLandingPage();
  }, []);

  // FETCH WISHLIST
  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const res = await fetch("/api/wishlist", {
          credentials: "include",
        });

        if (res.status === 401) {
          setWishlist([]);
          return;
        }

        if (!res.ok) return;

        const data = await res.json();

        const wishlistProducts =
          data.wishlist?.products ||
          data.products ||
          data.wishlist ||
          [];

        const wishlistIds = wishlistProducts
          .map((product) =>
            typeof product === "string" ? product : product?._id
          )
          .filter(Boolean);

        setWishlist(wishlistIds);
      } catch (error) {
        console.error("FETCH WISHLIST ERROR:", error);
      }
    };

    fetchWishlist();
  }, []);

  // SYNC WISHLIST
  useEffect(() => {
    const handleWishlistUpdated = async () => {
      try {
        const res = await fetch("/api/wishlist", {
          credentials: "include",
        });

        if (res.status === 401) {
          setWishlist([]);
          return;
        }

        if (!res.ok) return;

        const data = await res.json();

        const wishlistProducts =
          data.wishlist?.products ||
          data.products ||
          data.wishlist ||
          [];

        const wishlistIds = wishlistProducts
          .map((product) =>
            typeof product === "string" ? product : product?._id
          )
          .filter(Boolean);

        setWishlist(wishlistIds);
      } catch (error) {
        console.error("SYNC WISHLIST ERROR:", error);
      }
    };

    window.addEventListener("wishlistUpdated", handleWishlistUpdated);

    return () => {
      window.removeEventListener("wishlistUpdated", handleWishlistUpdated);
    };
  }, []);

  // CATEGORY FILTER
  const filteredProducts =
    category === "All"
      ? products
      : products.filter(
          (product) =>
            (product.category?.name || product.category || "")
              .toLowerCase() === category.toLowerCase()
        );

  // PRODUCT IMAGE
  const getProductImage = (product) => {
    if (product.images?.length > 0) {
      return product.images[0];
    }

    if (product.image) {
      return product.image;
    }

    return "/hero_img/hero-watch.jpg";
  };

  // WISHLIST TOGGLE
  const handleWishlist = async (productId) => {
    setMessage("");

    const alreadyWishlisted = wishlist.some(
      (id) => id?.toString() === productId?.toString()
    );

    setWishlist((current) => {
      if (alreadyWishlisted) {
        return current.filter(
          (id) => id?.toString() !== productId?.toString()
        );
      }

      return [...current, productId];
    });

    try {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ productId }),
      });

      const data = await res.json();

      if (res.status === 401) {
        setWishlist((current) => {
          if (alreadyWishlisted) {
            return current.some(
              (id) => id?.toString() === productId?.toString()
            )
              ? current
              : [...current, productId];
          }

          return current.filter(
            (id) => id?.toString() !== productId?.toString()
          );
        });

        window.location.href = "/auth";
        return;
      }

      if (!res.ok) {
        setWishlist((current) => {
          if (alreadyWishlisted) {
            return current.some(
              (id) => id?.toString() === productId?.toString()
            )
              ? current
              : [...current, productId];
          }

          return current.filter(
            (id) => id?.toString() !== productId?.toString()
          );
        });

        setMessage(data.message || "Unable to update wishlist.");
        return;
      }

      if (data.action === "added") {
        setWishlist((current) =>
          current.some((id) => id?.toString() === productId?.toString())
            ? current
            : [...current, productId]
        );
      }

      if (data.action === "removed") {
        setWishlist((current) =>
          current.filter((id) => id?.toString() !== productId?.toString())
        );
      }

      window.dispatchEvent(new Event("wishlistUpdated"));
    } catch (error) {
      console.error("WISHLIST ERROR:", error);

      setWishlist((current) => {
        if (alreadyWishlisted) {
          return current.some(
            (id) => id?.toString() === productId?.toString()
          )
            ? current
            : [...current, productId];
        }

        return current.filter(
          (id) => id?.toString() !== productId?.toString()
        );
      });

      setMessage("Unable to update wishlist.");
    }
  };

  // ADD TO CART
  const handleAddToCart = async (product) => {
    setMessage("");

    if (product.stock <= 0) {
      setMessage("Product is out of stock.");
      return;
    }

    const availableSizes = Array.isArray(product.size)
      ? product.size
      : product.size ? String(product.size).split(",") : [];

    const availableColors = Array.isArray(product.colors)
      ? product.colors
      : product.colors ? String(product.colors).split(",") : [];

    const selectedSize = availableSizes.length ? availableSizes[0].trim() : "";
    const selectedColor = availableColors.length ? availableColors[0].trim() : "";

    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          productId: product._id,
          quantity: 1,
          size: selectedSize,
          color: selectedColor,
        }),
      });

      const data = await res.json();

      if (res.status === 401) {
        window.location.href = "/auth";
        return;
      }

      if (!res.ok) {
        setMessage(data.message || "Unable to add product to cart.");
        return;
      }

      setMessage(`${product.name} added to cart.`);

      window.dispatchEvent(new Event("cartUpdated"));
    } catch (error) {
      console.error("ADD TO CART ERROR:", error);
      setMessage("Unable to add product to cart.");
    }
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

        {/* PAGE HEADER */}
        <section className="px-6 pb-10 pt-20 md:px-12">
          <div className="mx-auto max-w-7xl text-center">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.4em] text-amber-400">
              Time Aura Collection
            </p>

            <h1 className="font-serif text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
              Luxury Watch Boutique
            </h1>

            <p className="mx-auto mt-4 max-w-xl text-sm md:text-base font-light text-gray-400 leading-relaxed">
              Explore our master-crafted timepieces with complete specifications, modern aesthetics, and luxury precision.
            </p>
          </div>
        </section>

        {/* CATEGORY FILTER */}
        <section className="px-6 md:px-12">
          <div className="mx-auto flex max-w-7xl flex-wrap justify-center gap-3 border-b border-white/10 pb-8">
            {["All", "Luxury", "Classic", "Sport", "Smart"].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                className={`rounded-full border px-6 py-2.5 text-xs font-bold uppercase tracking-[0.15em] transition-all duration-300 ${
                  category === item
                    ? "border-amber-400 bg-amber-400 text-black shadow-lg shadow-amber-500/20 scale-105"
                    : "border-white/15 bg-white/5 text-gray-300 hover:border-amber-400/50 hover:text-white"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </section>

        {/* SHOP AD VIDEO */}
        {!adVideoLoading && adVideo && (
          <section className="px-6 pt-10 md:px-12">
            <div className="mx-auto max-w-5xl">
              <div className="overflow-hidden rounded-2xl border border-amber-400/30 bg-black shadow-2xl">
                <video
                  src={adVideo}
                  autoPlay
                  muted
                  loop
                  playsInline
                  controls={false}
                  className="h-[220px] w-full object-cover md:h-[380px]"
                />
              </div>
            </div>
          </section>
        )}

        {/* PRODUCTS GRID SECTION */}
        <section className="px-6 py-14 md:px-12">
          <div className="mx-auto max-w-7xl">
            
            {/* ALERT / MESSAGE */}
            {message && (
              <div className="mb-8 flex justify-center">
                <p className="rounded-xl border border-amber-400/40 bg-amber-400/10 px-6 py-3 text-sm font-semibold text-amber-300 shadow-md">
                  {message}
                </p>
              </div>
            )}

            {/* LOADING */}
            {loading && (
              <div className="flex min-h-[300px] items-center justify-center">
                <p className="text-sm font-bold uppercase tracking-[0.25em] text-amber-400 animate-pulse">
                  Loading Timepieces...
                </p>
              </div>
            )}

            {/* NO PRODUCTS */}
            {!loading && filteredProducts.length === 0 && (
              <div className="flex min-h-[300px] items-center justify-center">
                <div className="text-center">
                  <h2 className="font-serif text-2xl font-bold text-white">
                    No watches found
                  </h2>
                  <p className="mt-2 text-sm text-gray-400">
                    Try selecting another category.
                  </p>
                </div>
              </div>
            )}

            {/* PRODUCT GRID */}
            {!loading && filteredProducts.length > 0 && (
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredProducts.map((product) => {
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

                  const isWishlisted = wishlist.some(
                    (id) => id?.toString() === product._id?.toString()
                  );

                  const categoryName =
                    product.category?.name || product.category || "Luxury Watch";

                  const genderTag = product.gender || "Unisex";

                  // Extract colors list
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
                      {/* TOP 3D FLIP IMAGE CONTAINER */}
                      <div className="perspective-1000 relative h-[250px] w-full overflow-hidden bg-gradient-to-b from-[#161a24] via-[#0e2136] to-[#060911]">
                        
                        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(234,179,8,0.15)_0%,transparent_70%)]" />

                        {/* Animated Flip Wrapper */}
                        <Link
                          href={`/shop/${product._id}`}
                          className="absolute inset-0 block p-4"
                        >
                          <div className="flip-card-inner relative h-full w-full">
                            {/* Front Image */}
                            <div className="flip-card-front absolute inset-0 flex items-center justify-center">
                              <img
                                src={productImage}
                                alt={product.name}
                                className="h-full w-full object-contain drop-shadow-[0_15px_20px_rgba(0,0,0,0.7)]"
                              />
                            </div>

                            {/* Back Flip Image */}
                            <div className="flip-card-back absolute inset-0 flex items-center justify-center">
                              <img
                                src={secondImage}
                                alt={`${product.name} preview`}
                                className="h-full w-full object-contain drop-shadow-[0_15px_20px_rgba(0,0,0,0.7)]"
                              />
                            </div>
                          </div>
                        </Link>

                        {/* GOLDEN BLINKING PRICE BADGE */}
                        <div className="gold-price-blink absolute right-3 top-3 z-10 flex flex-col items-end rounded-xl px-3 py-1.5 transition-all">
                          <span className="text-sm font-black tracking-tight leading-none">
                            ₹{Number(offerPrice).toLocaleString("en-IN")}
                          </span>
                          {hasDiscount && (
                            <span className="mt-0.5 text-[10px] font-bold line-through opacity-80 leading-none">
                              ₹{Number(originalPrice).toLocaleString("en-IN")}
                            </span>
                          )}
                        </div>

                        {/* WISHLIST BUTTON */}
                        <button
                          type="button"
                          onClick={() => handleWishlist(product._id)}
                          aria-label={
                            isWishlisted
                              ? "Remove from wishlist"
                              : "Add to wishlist"
                          }
                          className="absolute left-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/60 text-white shadow-lg backdrop-blur-md transition-all duration-300 hover:scale-110 hover:border-red-400/50 hover:bg-white hover:text-black active:scale-90"
                        >
                          <Heart
                            size={18}
                            strokeWidth={1.8}
                            className={`transition-colors duration-200 ${
                              isWishlisted
                                ? "fill-red-500 text-red-500"
                                : "text-white"
                            }`}
                          />
                        </button>

                        {/* STOCK STATUS BADGE */}
                        <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1.5">
                          {product.stock > 0 ? (
                            <span className="rounded-md bg-emerald-500/20 border border-emerald-500/50 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                              In Stock ({product.stock})
                            </span>
                          ) : (
                            <span className="rounded-md bg-red-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                              Out of Stock
                            </span>
                          )}
                        </div>
                      </div>

                      {/* PRODUCT DETAILS AREA */}
                      <div className="flex flex-1 flex-col rounded-t-[20px] bg-[#161a23] p-5 -mt-3 relative z-10 border-t border-white/10">
                        
                        {/* CATEGORY & GENDER ROW */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-1.5">
                            <Tag size={13} className="text-amber-400" />
                            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                              {categoryName}
                            </span>
                          </div>

                          <div className="flex items-center gap-1 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full text-[10px] font-semibold text-gray-300 uppercase">
                            <UserCheck size={11} className="text-amber-400" />
                            {genderTag}
                          </div>
                        </div>

                        {/* TITLE & BRAND */}
                        <Link href={`/shop/${product._id}`}>
                          <h2 className="font-serif text-lg font-bold uppercase tracking-wide text-white transition-colors duration-300 hover:text-amber-300 line-clamp-1">
                            {product.name}
                          </h2>
                        </Link>

                        {product.brand && (
                          <p className="mt-0.5 text-xs font-semibold uppercase tracking-wider text-gray-400">
                            {product.brand}
                          </p>
                        )}

                        {/* DESCRIPTION */}
                        <p className="mt-2 text-xs text-gray-400 line-clamp-2 leading-relaxed">
                          {product.description || `${product.brand || "Time Aura"} premium timepiece built with luxury standards.`}
                        </p>

                        {/* COLOR OPTIONS PREVIEW */}
                        {colorsList.length > 0 && (
                          <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1">
                              <Layers size={11} className="text-amber-400" />
                              Colors ({colorsList.length}):
                            </span>
                            <div className="flex items-center gap-1.5">
                              {colorsList.slice(0, 4).map((color, idx) => (
                                <span
                                  key={idx}
                                  title={color}
                                  className="text-[10px] font-semibold bg-white/10 text-gray-200 border border-white/10 px-1.5 py-0.5 rounded"
                                >
                                  {color}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* RATING STARS */}
                        <div className="mt-3 flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((starIndex) => (
                            <Star
                              key={starIndex}
                              size={13}
                              className={
                                starIndex <= Math.floor(product.rating || 4.5)
                                  ? "fill-amber-400 text-amber-400"
                                  : "fill-gray-600 text-gray-600"
                              }
                            />
                          ))}
                          <span className="ml-1 text-[11px] font-bold text-gray-400">
                            ({product.rating || "4.8"})
                          </span>
                        </div>

                        {/* ACTION BUTTONS AREA */}
                        <div className="mt-auto pt-4 flex items-center gap-2">
                          
                          {/* Cart Button */}
                          <button
                            type="button"
                            disabled={product.stock === 0}
                            onClick={() => handleAddToCart(product)}
                            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 py-2.5 text-xs font-extrabold uppercase tracking-wider text-black shadow-md shadow-amber-500/20 hover:from-amber-400 hover:to-yellow-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <ShoppingBag size={16} strokeWidth={2} />
                            {product.stock === 0 ? "Out" : "Add"}
                          </button>

                          {/* View Single Product Button */}
                          <Link
                            href={`/shop/${product._id}`}
                            className="flex items-center justify-center gap-1 rounded-xl border border-white/20 bg-white/5 px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-all hover:border-amber-400 hover:bg-amber-400 hover:text-black"
                          >
                            <Eye size={16} />
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
        </section>

        <Footer />
      </main>
    </>
  );
}