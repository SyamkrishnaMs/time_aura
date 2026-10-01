"use client";

import { Heart, ShoppingBag, ArrowRight, Package } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";

export default function FeaturedWatches() {
  const [products, setProducts] = useState<any[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<{ [key: string]: string }>({});
  const [promoVideo, setPromoVideo] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    fetchProducts();
    fetchWishlist();
    fetchPromoVideo();
  }, []);

  // Fetch Admin Video for Top Banner
  const fetchPromoVideo = async () => {
    try {
      const response = await axios.get("/api/admin");
      if (response.data.success && response.data.videoUrl) {
        setPromoVideo(response.data.videoUrl);
      }
    } catch (error: any) {
      console.log("Video fetch error:", error.response?.data || error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get("/api/product");
      if (response.data.success) {
        setProducts(response.data.products || []);
      }
    } catch (error: any) {
      console.log("Product fetch error:", error.response?.data || error);
    }
  };

  const fetchWishlist = async () => {
    try {
      const response = await axios.get("/api/wishlist", {
        withCredentials: true,
      });

      if (response.data.success) {
        const ids = response.data.wishlist.map((item: any) =>
          typeof item === "object" ? item._id : item
        );
        setWishlist(ids);
      }
    } catch (error) {
      setWishlist([]);
    }
  };

  const toggleWishlist = async (productId: string) => {
    try {
      const response = await axios.post(
        "/api/wishlist",
        { productId },
        { withCredentials: true }
      );

      if (response.data.success) {
        if (response.data.action === "added") {
          setWishlist((prev) => [...prev, productId]);
        }

        if (response.data.action === "removed") {
          setWishlist((prev) =>
            prev.filter((id) => id && id.toString() !== productId.toString())
          );
        }

        window.dispatchEvent(new Event("wishlistUpdated"));
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        router.push("/auth");
        return;
      }
    }
  };

  const handleSizeChange = (productId: string, size: string) => {
    setSelectedSizes((prev) => ({
      ...prev,
      [productId]: size,
    }));
  };

  const handleAddToCart = async (productId: string, availableSizes: string[]) => {
    const sizeToAdd = selectedSizes[productId] || (availableSizes[0] ?? null);

    try {
      const response = await axios.post(
        "/api/cart",
        { productId, quantity: 1, size: sizeToAdd },
        { withCredentials: true }
      );

      if (response.data.success) {
        alert("Added to cart");
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        router.push("/auth");
        return;
      }
    }
  };

  return (
    <section id="feature" className="bg-[#f8f8f1] px-5 py-12 md:px-10 lg:px-16">
      <div className="mx-auto max-w-7xl">
        {/* ========================================================== */}
        {/* TOP AD / PROMO VIDEO BANNER SECTION                        */}
        {/* ========================================================== */}
        {promoVideo && (
          <div className="relative mb-12 overflow-hidden rounded-3xl border border-gray-200 bg-black shadow-xl">
            <video
              src={promoVideo}
              autoPlay
              muted
              loop
              playsInline
              className="h-[220px] w-full object-cover opacity-90 transition-opacity duration-300 hover:opacity-100 sm:h-[320px] md:h-[400px]"
            />
            <div className="absolute left-6 top-6">
              <span className="rounded-full bg-black/60 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-widest text-white backdrop-blur-md">
                Featured Ad
              </span>
            </div>
          </div>
        )}

        {/* SECTION HEADER */}
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.25em] text-gray-500">
              Our Collection
            </p>
            <h2 className="text-3xl font-semibold tracking-tight text-black md:text-4xl">
              Featured Watches
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-gray-500">
              Explore our collection of timeless watches designed for every occasion.
            </p>
          </div>

          <Link
            href="/shop"
            className="hidden items-center gap-2 text-sm font-semibold text-black transition-all hover:gap-3 md:flex"
          >
            View All
            <ArrowRight size={17} />
          </Link>
        </div>

        {/* PRODUCTS GRID */}
        {products.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white py-20 text-center text-gray-500">
            No watches available.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.slice(0, 8).map((product) => {
              const isWishlisted = wishlist.some(
                (id) => id && id.toString() === product._id?.toString()
              );

              // ==========================================
              // PRICE & DISCOUNT CALCULATIONS
              // ==========================================
              const offerPrice =
                product.offerPrice ?? product.discountPrice ?? product.price;
              const originalPrice =
                product.originalPrice ?? product.price ?? product.mrp ?? null;

              const discountPercent =
                originalPrice && originalPrice > offerPrice
                  ? Math.round(
                      ((originalPrice - offerPrice) / originalPrice) * 100
                    )
                  : null;

              const color = product.color || product.colour;

              // ==========================================
              // SAFE IMAGE URL FORMATTING (PREVENTS NEXT/IMAGE CRASH)
              // ==========================================
              const rawImage = product.imagePath || product.image;
              let imageSrc: string | null = null;

              if (rawImage && typeof rawImage === "string") {
                const trimmed = rawImage.trim();
                if (
                  trimmed.startsWith("http://") ||
                  trimmed.startsWith("https://") ||
                  trimmed.startsWith("/")
                ) {
                  imageSrc = trimmed;
                } else if (trimmed.length > 0) {
                  imageSrc = `/${trimmed}`;
                }
              }

              // Parse sizes array
              const availableSizes = product.size
                ? String(product.size)
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean)
                : [];

              return (
                <div
                  key={product._id}
                  className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  {/* Image Container */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#f3f3ee]">
                    {imageSrc ? (
                      <Image
                        src={imageSrc}
                        alt={product.name || "Watch"}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                        No Image
                      </div>
                    )}

                    {/* Wishlist Button */}
                    <button
                      type="button"
                      onClick={() => toggleWishlist(product._id)}
                      aria-label="Add to wishlist"
                      className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-sm transition-all duration-200 hover:scale-110 active:scale-95"
                    >
                      <Heart
                        size={18}
                        strokeWidth={1.8}
                        className={
                          isWishlisted
                            ? "fill-red-500 text-red-500"
                            : "text-gray-700 hover:text-red-500"
                        }
                      />
                    </button>
                  </div>

                  {/* Card Details */}
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="truncate text-lg font-bold text-gray-900">
                      {product.name}
                    </h3>

                    {product.description && (
                      <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-gray-500">
                        {product.description}
                      </p>
                    )}

                    {/* Product Tags */}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {product.brand && (
                        <span className="rounded-md border border-gray-100 bg-gray-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-gray-600">
                          {product.brand}
                        </span>
                      )}
                      {product.category && (
                        <span className="rounded-md border border-gray-100 bg-gray-50 px-2 py-1 text-[10px] font-medium text-gray-600">
                          {product.category}
                        </span>
                      )}
                      {product.gender && (
                        <span className="rounded-md border border-gray-100 bg-gray-50 px-2 py-1 text-[10px] font-medium text-gray-600">
                          {product.gender}
                        </span>
                      )}
                      {color && (
                        <span className="rounded-md border border-gray-100 bg-gray-50 px-2 py-1 text-[10px] font-medium text-gray-600">
                          Color: {color}
                        </span>
                      )}
                    </div>

                    {/* Stock Status */}
                    {product.stock !== undefined && (
                      <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-blue-600">
                        <Package size={14} />
                        <span>
                          {product.stock > 0
                            ? `In Stock: ${product.stock}`
                            : "Out of Stock"}
                        </span>
                      </div>
                    )}

                    {/* Size Selector Dropdown */}
                    {availableSizes.length > 0 && (
                      <div className="mt-4">
                        <select
                          className="w-full cursor-pointer appearance-none rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-xs font-semibold text-gray-700 outline-none transition-all focus:border-black focus:ring-1 focus:ring-black"
                          value={
                            selectedSizes[product._id] || availableSizes[0]
                          }
                          onChange={(e) =>
                            handleSizeChange(product._id, e.target.value)
                          }
                        >
                          {availableSizes.map((sizeOption, idx) => (
                            <option key={idx} value={sizeOption}>
                              Size: {sizeOption}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Bottom Area (Price & Action) */}
                    <div className="mt-auto pt-5">
                      {/* Price Section */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-2xl font-bold tracking-tight text-black">
                          ₹{offerPrice}
                        </span>

                        {originalPrice && originalPrice > offerPrice && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-400 line-through">
                              ₹{originalPrice}
                            </span>
                            <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-600">
                              {discountPercent}% OFF
                            </span>
                          </div>
                        )}
                      </div>

                      {/* COD & Add to Cart Button */}
                      <div className="mt-4 border-t border-gray-100 pt-4">
                        <p className="mb-3 text-center text-xs font-semibold text-green-600">
                          ✓ Cash on Delivery Available
                        </p>

                        <button
                          type="button"
                          disabled={product.stock === 0}
                          onClick={() => handleAddToCart(product._id, availableSizes)}
                          className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white transition-all duration-200 ${
                            product.stock === 0
                              ? "cursor-not-allowed bg-gray-300"
                              : "bg-black hover:bg-gray-800 active:scale-[0.98]"
                          }`}
                        >
                          <ShoppingBag size={17} />
                          {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Mobile View All Button */}
        <div className="mt-9 flex justify-center md:hidden">
          <Link
            href="/shop"
            className="flex items-center gap-2 text-sm font-semibold text-black"
          >
            View All
            <ArrowRight size={17} />
          </Link>
        </div>
      </div>
    </section>
  );
}