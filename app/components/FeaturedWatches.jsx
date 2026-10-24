"use client";

import {
  Heart,
  ShoppingBag,
  ArrowRight,
  Star,
  Tag,
} from "lucide-react";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";

export default function FeaturedWatches() {
  const [products, setProducts] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState({});
  const [promoVideo, setPromoVideo] = useState(null);
  const [cartMessage, setCartMessage] = useState({});

  const router = useRouter();

  // INITIAL FETCH
  useEffect(() => {
    fetchProducts();
    fetchWishlist();
    fetchPromoVideo();
  }, []);

  // WISHLIST SYNC
  useEffect(() => {
    const handleWishlistUpdated = () => {
      fetchWishlist();
    };

    window.addEventListener("wishlistUpdated", handleWishlistUpdated);

    return () => {
      window.removeEventListener("wishlistUpdated", handleWishlistUpdated);
    };
  }, []);

  // FETCH PROMO VIDEO
  const fetchPromoVideo = async () => {
    try {
      const response = await axios.get("/api/admin");

      if (response.data.success && response.data.videoUrl) {
        setPromoVideo(response.data.videoUrl);
      }
    } catch (error) {
      console.log("Video fetch error:", error.response?.data || error);
    }
  };

  // FETCH PRODUCTS
  const fetchProducts = async () => {
    try {
      const response = await axios.get("/api/product");

      if (response.data.success) {
        setProducts(response.data.products || []);
      }
    } catch (error) {
      console.log("Product fetch error:", error.response?.data || error);
    }
  };

  // FETCH WISHLIST
  const fetchWishlist = async () => {
    try {
      const response = await axios.get("/api/wishlist", {
        withCredentials: true,
      });

      if (response.data.success) {
        const ids = (response.data.wishlist || []).map((item) =>
          typeof item === "object" ? item._id : item
        );

        setWishlist(ids);
      }
    } catch {
      setWishlist([]);
    }
  };

  // TOGGLE WISHLIST
  const toggleWishlist = async (productId) => {
    const alreadyWishlisted = wishlist.some(
      (id) => id?.toString() === productId?.toString()
    );

    // Optimistic UI
    setWishlist((current) => {
      if (alreadyWishlisted) {
        return current.filter(
          (id) => id?.toString() !== productId?.toString()
        );
      }

      return [...current, productId];
    });

    try {
      const response = await axios.post(
        "/api/wishlist",
        { productId },
        { withCredentials: true }
      );

      if (response.data.success) {
        if (response.data.action === "added") {
          setWishlist((current) =>
            current.some(
              (id) => id?.toString() === productId?.toString()
            )
              ? current
              : [...current, productId]
          );
        }

        if (response.data.action === "removed") {
          setWishlist((current) =>
            current.filter(
              (id) => id?.toString() !== productId?.toString()
            )
          );
        }

        window.dispatchEvent(new Event("wishlistUpdated"));
      }
    } catch (error) {
      // Rollback optimistic update
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

      if (error.response?.status === 401) {
        router.push("/auth");
        return;
      }

      console.log("Wishlist error:", error.response?.data || error);
    }
  };

  // SIZE CHANGE
  const handleSizeChange = (productId, size) => {
    setSelectedSizes((prev) => ({
      ...prev,
      [productId]: size,
    }));

    setCartMessage((prev) => {
      const updated = { ...prev };
      delete updated[productId];
      return updated;
    });
  };

  // ADD TO CART
  const handleAddToCart = async (
    productId,
    availableSizes,
    availableColors
  ) => {
    const sizeToAdd = selectedSizes[productId] || null;

    if (availableSizes.length > 0 && !sizeToAdd) {
      setCartMessage((prev) => ({
        ...prev,
        [productId]: "Please select a size",
      }));
      return;
    }

    const colorToAdd =
      availableColors.length > 0 ? availableColors[0] : "";

    try {
      const response = await axios.post(
        "/api/cart",
        {
          productId,
          quantity: 1,
          size: sizeToAdd,
          color: colorToAdd,
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        setCartMessage((prev) => ({
          ...prev,
          [productId]: "Added to cart",
        }));

        window.dispatchEvent(new Event("cartUpdated"));

        setTimeout(() => {
          setCartMessage((prev) => {
            const updated = { ...prev };
            delete updated[productId];
            return updated;
          });
        }, 2000);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        router.push("/auth");
        return;
      }

      setCartMessage((prev) => ({
        ...prev,
        [productId]:
          error.response?.data?.message || "Unable to add to cart",
      }));
    }
  };

  return (
    <>
      <style jsx global>{`
        /* Golden blinking border animation */
        @keyframes borderBlink {
          0%, 100% {
            border-color: rgba(234, 179, 8, 0.8);
            box-shadow: 0 0 15px rgba(234, 179, 8, 0.3), 0 8px 25px rgba(0, 0, 0, 0.2);
          }
          50% {
            border-color: rgba(234, 179, 8, 0.25);
            box-shadow: 0 0 5px rgba(234, 179, 8, 0.1), 0 8px 25px rgba(0, 0, 0, 0.2);
          }
        }

        /* Gold Price Tag Blinking Animation */
        @keyframes goldPriceBlink {
          0%, 100% {
            background-color: #eab308;
            color: #000000;
            box-shadow: 0 0 18px rgba(234, 179, 8, 0.9), 0 0 35px rgba(234, 179, 8, 0.5);
            transform: scale(1);
          }
          50% {
            background-color: #ca8a04;
            color: #ffffff;
            box-shadow: 0 0 6px rgba(202, 138, 4, 0.4);
            transform: scale(0.97);
          }
        }

        .gold-blink-card {
          animation: borderBlink 2.5s infinite ease-in-out;
        }

        .gold-price-blink {
          animation: goldPriceBlink 1.8s infinite ease-in-out;
        }
      `}</style>

      <section
        id="feature"
        className="bg-[#f8f8f1] px-4 py-10 sm:px-6 md:px-10 md:py-14 lg:px-16"
      >
        <div className="mx-auto max-w-7xl">

          {/* PROMO VIDEO */}
          {promoVideo && (
            <div className="relative mb-10 overflow-hidden rounded-2xl border border-black/10 bg-black shadow-xl">
              <video
                src={promoVideo}
                autoPlay
                muted
                loop
                playsInline
                className="h-[190px] w-full object-cover sm:h-[280px] md:h-[360px]"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

              <div className="absolute left-4 top-4 sm:left-6 sm:top-6">
                <span className="rounded-full border border-white/20 bg-black/50 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-white backdrop-blur-md">
                  Featured Collection
                </span>
              </div>
            </div>
          )}

          {/* SECTION HEADER */}
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-gray-500 sm:text-sm">
                The Time Aura Collection
              </p>

              <h2 className="font-serif text-3xl font-bold tracking-tight text-black sm:text-4xl md:text-5xl">
                Featured Watches
              </h2>

              <div className="mt-4 h-1 w-16 rounded-full bg-black" />
            </div>

            <Link
              href="/shop"
              className="hidden items-center gap-2 border-b-2 border-black pb-2 text-sm font-bold uppercase tracking-[0.12em] text-black transition-all hover:gap-4 md:flex"
            >
              View All
              <ArrowRight size={18} />
            </Link>
          </div>

          {/* PRODUCTS GRID */}
          {products.length === 0 ? (
            <div className="rounded-2xl border border-black/10 bg-white py-16 text-center">
              <p className="font-serif text-2xl font-semibold text-gray-700">
                No watches available
              </p>
              <p className="mt-3 text-base text-gray-500">
                Our collection is being updated.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.slice(0, 8).map((product) => {
                const isWishlisted = wishlist.some(
                  (id) => id && id.toString() === product._id?.toString()
                );

                // PRICES CALCULATIONS
                const offerPrice =
                  product.offerPrice ??
                  product.discountPrice ??
                  product.price;

                const originalPrice =
                  product.originalPrice ??
                  product.mrp ??
                  (product.offerPrice || product.discountPrice ? product.price : null);

                const hasOfferPrice =
                  offerPrice !== null &&
                  offerPrice !== undefined &&
                  offerPrice !== "" &&
                  Number.isFinite(Number(offerPrice));

                const hasDiscount =
                  hasOfferPrice &&
                  originalPrice &&
                  Number(originalPrice) > Number(offerPrice);

                // IMAGE
                const rawImage =
                  Array.isArray(product.images) && product.images.length > 0
                    ? product.images[0]
                    : product.imagePath || product.image;

                const imageSrc =
                  typeof rawImage === "string" && rawImage.trim()
                    ? rawImage.trim()
                    : null;

                // SIZES & COLORS
                const availableSizes = Array.isArray(product.size)
                  ? product.size
                  : product.size
                  ? String(product.size)
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean)
                  : [];

                const availableColors = Array.isArray(product.colors)
                  ? product.colors
                  : product.colors
                  ? String(product.colors)
                      .split(",")
                      .map((c) => c.trim())
                      .filter(Boolean)
                  : [];

                const rating = product.rating || 4.5;
                const categoryName = product.category?.name || product.category || "Luxury Watch";

                return (
                  <article
                    key={product._id}
                    className="gold-blink-card group relative flex flex-col overflow-hidden rounded-[24px] bg-[#121418] text-white border-2 transition-all duration-500 hover:-translate-y-2"
                  >
                    {/* TOP VISUAL SECTION WITH IMAGE */}
                    <div className="relative h-[250px] w-full overflow-hidden bg-gradient-to-b from-[#151922] via-[#0d2137] to-[#040810]">
                      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(234,179,8,0.15)_0%,transparent_70%)]" />

                      <Link
                        href={`/shop/${product._id}`}
                        className="absolute inset-0 flex items-center justify-center p-4"
                      >
                        {imageSrc ? (
                          <div className="relative h-full w-full">
                            <Image
                              src={imageSrc}
                              alt={product.name || "Watch"}
                              fill
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                              className="object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)] transition-transform duration-700 group-hover:scale-105"
                            />
                          </div>
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-gray-400">
                            No Image
                          </div>
                        )}
                      </Link>

                      {/* GOLDEN BLINKING PRICE BADGE */}
                      {hasOfferPrice && (
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
                      )}

                      {/* WISHLIST BUTTON */}
                      <button
                        type="button"
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          toggleWishlist(product._id);
                        }}
                        aria-label={
                          isWishlisted
                            ? "Remove from wishlist"
                            : "Add to wishlist"
                        }
                        className="absolute left-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/60 text-white shadow-lg backdrop-blur-md transition-all duration-300 hover:scale-110 hover:border-red-400/50 hover:bg-white active:scale-90"
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

                      {/* OUT OF STOCK BADGE */}
                      {product.stock === 0 && (
                        <span className="absolute bottom-3 left-3 z-10 rounded-md bg-red-600 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-white">
                          Out of Stock
                        </span>
                      )}
                    </div>

                    {/* LOWER CONTENT AREA */}
                    <div className="flex flex-1 flex-col rounded-t-[20px] bg-[#16191f] p-5 -mt-3 relative z-10 border-t border-white/10">
                      
                      {/* CATEGORY TAG & NAME */}
                      <div>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <Tag size={12} className="text-amber-400" />
                          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                            {categoryName}
                          </span>
                        </div>

                        <Link href={`/shop/${product._id}`}>
                          <h3 className="font-serif text-lg font-bold uppercase tracking-wide text-white transition-colors duration-300 hover:text-amber-300 line-clamp-1">
                            {product.name}
                          </h3>
                        </Link>

                        <p className="mt-1.5 text-xs text-gray-400 line-clamp-2 leading-relaxed">
                          {product.description ||
                            `${product.brand || "Time Aura"} precision timepiece built with advanced features.`}
                        </p>
                      </div>

                      {/* RATING STARS */}
                      <div className="mt-3 flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((starIndex) => (
                          <Star
                            key={starIndex}
                            size={13}
                            className={
                              starIndex <= Math.floor(rating)
                                ? "fill-amber-400 text-amber-400"
                                : "fill-gray-600 text-gray-600"
                            }
                          />
                        ))}
                      </div>

                      {/* SIZES PICKER */}
                      {availableSizes.length > 0 && (
                        <div className="mt-3 pt-2 border-t border-white/10">
                          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                            <span className="text-[10px] font-bold text-gray-400 uppercase">Size:</span>
                            {availableSizes.map((sizeOption) => {
                              const isSelected = selectedSizes[product._id] === sizeOption;
                              return (
                                <button
                                  key={sizeOption}
                                  type="button"
                                  onClick={() => handleSizeChange(product._id, sizeOption)}
                                  className={`rounded px-2 py-0.5 text-[10px] font-bold transition-all ${
                                    isSelected
                                      ? "bg-amber-400 text-black"
                                      : "bg-white/10 text-white hover:bg-amber-400/30"
                                  }`}
                                >
                                  {sizeOption}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* CART MESSAGE */}
                      {cartMessage[product._id] && (
                        <p
                          role="status"
                          className={`mt-2 text-center text-xs font-bold ${
                            cartMessage[product._id] === "Added to cart"
                              ? "text-emerald-400"
                              : "text-red-400"
                          }`}
                        >
                          {cartMessage[product._id]}
                        </p>
                      )}

                      {/* ADD TO CART BUTTON */}
                      <div className="mt-auto pt-4">
                        <button
                          type="button"
                          disabled={product.stock === 0 || product.stock === null}
                          onClick={() =>
                            handleAddToCart(
                              product._id,
                              availableSizes,
                              availableColors
                            )
                          }
                          className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-xs font-extrabold uppercase tracking-[0.15em] transition-all duration-300 ${
                            product.stock === 0 || product.stock === null
                              ? "cursor-not-allowed bg-gray-700 text-gray-400"
                              : "bg-gradient-to-r from-amber-500 to-yellow-600 text-black shadow-md shadow-amber-500/20 hover:from-amber-400 hover:to-yellow-500 active:scale-[0.98]"
                          }`}
                        >
                          <ShoppingBag size={16} strokeWidth={2} />
                          {product.stock === 0 || product.stock === null
                            ? "Out of Stock"
                            : "Add to Cart"}
                        </button>
                      </div>

                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {/* MOBILE VIEW ALL BUTTON */}
          <div className="mt-8 flex justify-center md:hidden">
            <Link
              href="/shop"
              className="flex items-center gap-2 border-b-2 border-black pb-2 text-sm font-bold uppercase tracking-[0.15em] text-black transition-all hover:gap-4"
            >
              View All
              <ArrowRight size={18} />
            </Link>
          </div>

        </div>
      </section>
    </>
  );
}