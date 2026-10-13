
"use client";

import {
  Heart,
  ShoppingBag,
  ArrowRight,
  Star,
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

    window.addEventListener(
      "wishlistUpdated",
      handleWishlistUpdated
    );

    return () => {
      window.removeEventListener(
        "wishlistUpdated",
        handleWishlistUpdated
      );
    };
  }, []);

  // FETCH PROMO VIDEO
  const fetchPromoVideo = async () => {
    try {
      const response = await axios.get("/api/admin");

      if (
        response.data.success &&
        response.data.videoUrl
      ) {
        setPromoVideo(response.data.videoUrl);
      }
    } catch (error) {
      console.log(
        "Video fetch error:",
        error.response?.data || error
      );
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
      console.log(
        "Product fetch error:",
        error.response?.data || error
      );
    }
  };

  // FETCH WISHLIST
  const fetchWishlist = async () => {
    try {
      const response = await axios.get(
        "/api/wishlist",
        {
          withCredentials: true,
        }
      );

      if (response.data.success) {
        const ids = (response.data.wishlist || []).map(
          (item) =>
            typeof item === "object"
              ? item._id
              : item
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
      (id) =>
        id?.toString() === productId?.toString()
    );

    // Optimistic UI
    setWishlist((current) => {
      if (alreadyWishlisted) {
        return current.filter(
          (id) =>
            id?.toString() !== productId?.toString()
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
              (id) =>
                id?.toString() === productId?.toString()
            )
              ? current
              : [...current, productId]
          );
        }

        if (response.data.action === "removed") {
          setWishlist((current) =>
            current.filter(
              (id) =>
                id?.toString() !== productId?.toString()
            )
          );
        }

        window.dispatchEvent(
          new Event("wishlistUpdated")
        );
      }
    } catch (error) {
      // Rollback optimistic update
      setWishlist((current) => {
        if (alreadyWishlisted) {
          return current.some(
            (id) =>
              id?.toString() === productId?.toString()
          )
            ? current
            : [...current, productId];
        }

        return current.filter(
          (id) =>
            id?.toString() !== productId?.toString()
        );
      });

      if (error.response?.status === 401) {
        router.push("/auth");
        return;
      }

      console.log(
        "Wishlist error:",
        error.response?.data || error
      );
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
      availableColors.length > 0
        ? availableColors[0]
        : "";

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

        window.dispatchEvent(
          new Event("cartUpdated")
        );

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
          error.response?.data?.message ||
          "Unable to add to cart",
      }));
    }
  };

  return (
    <section
      id="feature"
      className="bg-[#f8f8f1] px-4 py-8 md:px-10 md:py-12 lg:px-16"
    >
      <div className="mx-auto max-w-7xl">

        {/* PROMO VIDEO */}
        {promoVideo && (
          <div className="relative mb-9 overflow-hidden rounded-2xl border border-black/10 bg-black shadow-[0_15px_40px_rgba(0,0,0,0.12)]">
            <video
              src={promoVideo}
              autoPlay
              muted
              loop
              playsInline
              className="h-[180px] w-full object-cover opacity-90 sm:h-[260px] md:h-[340px]"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10" />

            <div className="absolute left-4 top-4 md:left-6 md:top-6">
              <span className="rounded-full border border-white/20 bg-black/50 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white backdrop-blur-md">
                Featured Collection
              </span>
            </div>
          </div>
        )}

        {/* SECTION HEADER */}
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-gray-500">
              The Time Aura Collection
            </p>

            <h2 className="font-serif text-3xl font-medium tracking-tight text-black md:text-4xl lg:text-5xl">
              Featured Watches
            </h2>

            <div className="mt-3 h-px w-12 bg-black" />
          </div>

          <Link
            href="/shop"
            className="hidden items-center gap-2 border-b border-black pb-1 text-sm font-semibold uppercase tracking-[0.12em] text-black transition-all hover:gap-3 md:flex"
          >
            View All
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* PRODUCTS */}
        {products.length === 0 ? (
          <div className="rounded-2xl border border-black/10 bg-white py-16 text-center">
            <p className="font-serif text-xl text-gray-700">
              No watches available
            </p>

            <p className="mt-2 text-sm text-gray-400">
              Our collection is being updated.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4">

            {products.slice(0, 8).map((product) => {
              // WISHLIST
              const isWishlisted = wishlist.some(
                (id) =>
                  id &&
                  id.toString() === product._id?.toString()
              );

              // PRICE
              const offerPrice =
                product.offerPrice ??
                product.discountPrice ??
                product.price;

              const originalPrice =
                product.originalPrice ??
                product.price ??
                product.mrp ??
                null;

              const discountPercent =
                originalPrice &&
                Number(originalPrice) > Number(offerPrice)
                  ? Math.round(
                      ((Number(originalPrice) -
                        Number(offerPrice)) /
                        Number(originalPrice)) *
                        100
                    )
                  : null;

              // IMAGE
              const rawImage =
                Array.isArray(product.images) &&
                product.images.length > 0
                  ? product.images[0]
                  : product.imagePath || product.image;

              const imageSrc =
                typeof rawImage === "string" &&
                rawImage.trim()
                  ? rawImage.trim()
                  : null;

              // SIZES
              const availableSizes = Array.isArray(
                product.size
              )
                ? product.size
                : product.size
                ? String(product.size)
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean)
                : [];

              // COLOURS
              const availableColors = Array.isArray(
                product.colors
              )
                ? product.colors
                : product.colors
                ? String(product.colors)
                    .split(",")
                    .map((c) => c.trim())
                    .filter(Boolean)
                : [];

              // RATING
              const rating = product.rating || 4.2;

              return (
                <div
                  key={product._id}
                  className="group relative flex flex-col overflow-hidden rounded-xl border border-black/[0.06] bg-white shadow-[0_3px_15px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(0,0,0,0.10)]"
                >
                  {/* IMAGE */}
                  <Link
                    href={`/shop/${product._id}`}
                    className="block"
                  >
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#f1f0ea]">
                      {imageSrc ? (
                        <Image
                          src={imageSrc}
                          alt={product.name || "Watch"}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-sm text-gray-400">
                          No Image
                        </div>
                      )}

                      {/* DISCOUNT */}
                      {discountPercent && (
                        <span className="absolute left-2 top-2 rounded-sm bg-black px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                          {discountPercent}% OFF
                        </span>
                      )}

                      {/* WISHLIST */}
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
                        className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-md transition-all duration-200 hover:scale-110 active:scale-90"
                      >
                        <Heart
                          size={17}
                          strokeWidth={1.8}
                          className={
                            isWishlisted
                              ? "fill-red-500 text-red-500"
                              : "text-gray-700"
                          }
                        />
                      </button>

                      {/* RATING */}
                      <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-md bg-white/95 px-2 py-1 text-xs font-semibold text-gray-800 shadow-sm backdrop-blur-sm">
                        <span>{rating}</span>
                        <Star
                          size={11}
                          className="fill-black text-black"
                        />
                      </div>
                    </div>
                  </Link>

                  {/* PRODUCT DETAILS */}
                  <div className="flex flex-1 flex-col p-2.5 md:p-3">

                    {/* BRAND */}
                    {product.brand && (
                      <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-500">
                        {product.brand}
                      </p>
                    )}

                    {/* NAME */}
                    <h3 className="line-clamp-1 font-serif text-base font-semibold tracking-tight text-gray-900">
                      {product.name}
                    </h3>

                    {/* PRODUCT ID */}
                    <Link
                      href={`/shop/${product._id}`}
                      className="mt-1 block w-fit text-[10px] text-gray-400 transition-colors hover:text-black"
                    >
                      ID: {product._id}
                    </Link>

                    {/* PRICE */}
                    <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="text-base font-bold text-black">
                        ₹
                        {Number(offerPrice).toLocaleString(
                          "en-IN"
                        )}
                      </span>

                      {originalPrice &&
                        Number(originalPrice) >
                          Number(offerPrice) && (
                          <>
                            <span className="text-xs text-gray-400 line-through">
                              ₹
                              {Number(
                                originalPrice
                              ).toLocaleString("en-IN")}
                            </span>

                            <span className="text-[10px] font-bold uppercase tracking-wide text-red-500">
                              {discountPercent}% Off
                            </span>
                          </>
                        )}
                    </div>

                    {/* CATEGORY / GENDER */}
                    <div className="mt-2 flex flex-wrap gap-1">
                      {product.category && (
                        <span className="rounded-full border border-gray-200 px-2 py-1 text-[9px] font-medium uppercase tracking-wide text-gray-600">
                          {product.category}
                        </span>
                      )}

                      {product.gender && (
                        <span className="rounded-full border border-gray-200 px-2 py-1 text-[9px] font-medium uppercase tracking-wide text-gray-600">
                          {product.gender}
                        </span>
                      )}
                    </div>

                    {/* AVAILABLE COLOURS */}
                    {availableColors.length > 0 && (
                      <div className="mt-2">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                          Available Colours
                        </p>

                        <p className="mt-0.5 line-clamp-1 text-[11px] text-gray-700">
                          {availableColors.join(", ")}
                        </p>
                      </div>
                    )}

                    {/* SIZE */}
                    {availableSizes.length > 0 && (
                      <div className="mt-2">
                        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                          Select Size
                        </p>

                        <div className="flex flex-wrap gap-1">
                          {availableSizes.map((sizeOption) => {
                            const isSelected =
                              selectedSizes[product._id] ===
                              sizeOption;

                            return (
                              <button
                                key={sizeOption}
                                type="button"
                                onClick={() =>
                                  handleSizeChange(
                                    product._id,
                                    sizeOption
                                  )
                                }
                                className={`rounded-md border px-2 py-1.5 text-[10px] font-semibold transition-all duration-200 ${
                                  isSelected
                                    ? "border-black bg-black text-white"
                                    : "border-gray-200 bg-gray-50 text-gray-700 hover:border-black hover:text-black"
                                }`}
                              >
                                {sizeOption}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* STOCK */}
                    {product.stock !== undefined && (
                      <p
                        className={`mt-2 text-[10px] font-medium ${
                          product.stock > 0
                            ? "text-gray-600"
                            : "text-red-500"
                        }`}
                      >
                        {product.stock > 0
                          ? `${product.stock} available`
                          : "Out of stock"}
                      </p>
                    )}

                    {/* CART */}
                    <div className="mt-auto pt-3">
                      {cartMessage[product._id] && (
                        <p
                          className={`mb-2 text-center text-[10px] font-semibold ${
                            cartMessage[product._id] ===
                            "Added to cart"
                              ? "text-green-600"
                              : "text-red-500"
                          }`}
                        >
                          {cartMessage[product._id]}
                        </p>
                      )}

                      <button
                        type="button"
                        disabled={product.stock === 0}
                        onClick={() =>
                          handleAddToCart(
                            product._id,
                            availableSizes,
                            availableColors
                          )
                        }
                        className={`flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] transition-all duration-200 ${
                          product.stock === 0
                            ? "cursor-not-allowed bg-gray-200 text-gray-400"
                            : "bg-black text-white hover:bg-gray-800 active:scale-[0.97]"
                        }`}
                      >
                        <ShoppingBag
                          size={14}
                          strokeWidth={1.8}
                        />

                        {product.stock === 0
                          ? "Out of Stock"
                          : "Add to Cart"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* MOBILE VIEW ALL */}
        <div className="mt-7 flex justify-center md:hidden">
          <Link
            href="/shop"
            className="flex items-center gap-2 border-b border-black pb-1 text-xs font-semibold uppercase tracking-[0.15em] text-black"
          >
            View All
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
}
