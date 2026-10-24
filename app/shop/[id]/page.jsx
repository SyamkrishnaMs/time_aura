"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import {
  ArrowLeft,
  ShoppingBag,
  Plus,
  Minus,
  ShieldCheck,
  Truck,
  RotateCcw,
  Star,
  CheckCircle2,
  Tag,
  UserCheck,
} from "lucide-react";

export default function SingleProductPage() {
  const params = useParams();
  const router = useRouter();

  const productId = params.id;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);

  // FETCH PRODUCT
  useEffect(() => {
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setMessage("");

      const response = await axios.get("/api/admin");

      const products =
        response.data.products || response.data || [];

      const foundProduct = products.find(
        (item) => item._id === productId
      );

      if (!foundProduct) {
        setMessage("Product not found.");
        return;
      }

      setProduct(foundProduct);

      // Default size
      if (foundProduct.size?.length > 0) {
        setSelectedSize(foundProduct.size[0]);
      }

      // Default color
      if (foundProduct.colors?.length > 0) {
        setSelectedColor(foundProduct.colors[0]);
      }
    } catch (error) {
      console.error("FETCH SINGLE PRODUCT ERROR:", error);

      setMessage(
        error.response?.data?.message ||
          "Unable to load product details."
      );
    } finally {
      setLoading(false);
    }
  };

  // QUANTITY
  const increaseQuantity = () => {
    if (!product) return;

    if (quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  // ADD TO CART
  const handleAddToCart = async () => {
    try {
      if (!product) return;

      setMessage("");

      // Stock validation
      if (product.stock <= 0) {
        setMessage("Product is currently out of stock.");
        return;
      }

      // Size validation
      if (product.size?.length > 0 && !selectedSize) {
        setMessage("Please select a size before adding to cart.");
        return;
      }

      // Color validation
      if (product.colors?.length > 0 && !selectedColor) {
        setMessage("Please select a color option.");
        return;
      }

      // Add product to cart
      await axios.post(
        "/api/cart",
        {
          productId: product._id,
          quantity,
          size: selectedSize,
          color: selectedColor,
        },
        {
          withCredentials: true,
        }
      );

      // Go to cart
      router.push("/cart");
    } catch (error) {
      console.error("ADD TO CART ERROR:", error);

      if (error.response?.status === 401) {
        router.push("/auth");
        return;
      }

      setMessage(
        error.response?.data?.message ||
          "Unable to add product to cart."
      );
    }
  };

  // LOADING STATE
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0c0d10] flex items-center justify-center">
        <p className="text-base text-amber-400 font-semibold tracking-wider animate-pulse">
          Loading Time Aura Timepiece...
        </p>
      </div>
    );
  }

  // PRODUCT NOT FOUND
  if (!product) {
    return (
      <div className="min-h-screen bg-[#0c0d10] text-white flex flex-col items-center justify-center px-6 text-center">
        <h1 className="text-3xl font-serif font-bold text-amber-400">
          Product Not Found
        </h1>

        <p className="text-sm text-gray-400 mt-3 max-w-md">
          {message || "The watch you are looking for is no longer available or does not exist."}
        </p>

        <Link
          href="/shop"
          className="mt-6 bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-extrabold px-8 py-3 rounded-xl text-sm uppercase tracking-widest hover:scale-105 transition-all"
        >
          Explore Collection
        </Link>
      </div>
    );
  }

  // PRODUCT DATA PROCESSING
  const images =
    product.images?.length > 0
      ? product.images
      : product.image
      ? [product.image]
      : ["/hero_img/hero-watch.jpg"];

  const offerPrice = product.offerPrice || product.discountPrice || product.price;

  const originalPrice = product.originalPrice || product.mrp || (product.offerPrice ? product.price : null);

  const hasOffer =
    originalPrice && Number(offerPrice) < Number(originalPrice);

  const discountPercentage = hasOffer
    ? Math.round(
        ((Number(originalPrice) - Number(offerPrice)) / Number(originalPrice)) * 100
      )
    : 0;

  const categoryName = product.category?.name || product.category || "Luxury Edition";
  const genderTag = product.gender || "Unisex";
  const rating = product.rating || 4.8;

  return (
    <>
      <style jsx global>{`
        @keyframes borderBlink {
          0%, 100% {
            border-color: rgba(234, 179, 8, 0.8);
            box-shadow: 0 0 20px rgba(234, 179, 8, 0.3);
          }
          50% {
            border-color: rgba(234, 179, 8, 0.3);
            box-shadow: 0 0 5px rgba(234, 179, 8, 0.1);
          }
        }

        @keyframes goldPriceBlink {
          0%, 100% {
            background-color: #eab308;
            color: #000000;
            box-shadow: 0 0 20px rgba(234, 179, 8, 0.8);
          }
          50% {
            background-color: #ca8a04;
            color: #ffffff;
            box-shadow: 0 0 8px rgba(202, 138, 4, 0.4);
          }
        }

        .gold-blink-box {
          animation: borderBlink 2.5s infinite ease-in-out;
        }

        .gold-price-badge {
          animation: goldPriceBlink 2s infinite ease-in-out;
        }
      `}</style>

      <div className="min-h-screen bg-[#0e1015] text-white">

        {/* NAVBAR */}
        <nav className="bg-[#12151c] border-b border-white/10 px-6 py-4 sticky top-0 z-50 backdrop-blur-md">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link
              href="/"
              className="text-lg md:text-xl font-serif font-bold tracking-[0.25em] text-white hover:text-amber-400 transition-colors"
            >
              TIME AURA
            </Link>

            <div className="flex items-center gap-6">
              <Link
                href="/shop"
                className="text-xs md:text-sm font-semibold uppercase tracking-wider text-gray-300 hover:text-amber-400 transition-colors"
              >
                Collection
              </Link>

              <Link
                href="/cart"
                className="flex items-center gap-2 bg-white/10 px-3.5 py-1.5 rounded-full hover:bg-amber-400 hover:text-black transition-all"
              >
                <ShoppingBag size={18} />
                <span className="text-xs font-bold uppercase tracking-wider">Cart</span>
              </Link>
            </div>
          </div>
        </nav>

        {/* BACK TO SHOP LINK */}
        <div className="max-w-7xl mx-auto px-6 pt-5">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-xs md:text-sm font-bold uppercase tracking-wider text-amber-400 hover:text-amber-300 transition-all"
          >
            <ArrowLeft size={16} />
            Back to Collection
          </Link>
        </div>

        {/* MAIN PRODUCT DISPLAY */}
        <main className="max-w-7xl mx-auto px-6 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">

            {/* LEFT COLUMN - IMAGES GALLERY */}
            <div className="flex flex-col gap-4">
              
              {/* Main Image View */}
              <div className="gold-blink-box relative bg-[#161a23] border-2 rounded-3xl overflow-hidden aspect-square flex items-center justify-center p-6 shadow-2xl">
                <img
                  src={images[activeImage]}
                  alt={product.name}
                  className="w-full h-full object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.8)] transition-all duration-500 hover:scale-105"
                />

                {hasOffer && (
                  <span className="gold-price-badge absolute top-4 left-4 text-xs font-black px-3.5 py-1.5 rounded-xl uppercase tracking-wider">
                    {discountPercentage}% OFF
                  </span>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex items-center gap-3 overflow-x-auto pb-2">
                  {images.map((imgUrl, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setActiveImage(index)}
                      className={`relative w-20 h-20 rounded-2xl overflow-hidden bg-[#161a23] border-2 transition-all flex-shrink-0 ${
                        activeImage === index
                          ? "border-amber-400 scale-105 shadow-lg shadow-amber-500/20"
                          : "border-white/10 opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={imgUrl}
                        alt={`${product.name} thumbnail ${index + 1}`}
                        className="w-full h-full object-contain p-2"
                      />
                    </button>
                  ))}
                </div>
              )}

            </div>

            {/* RIGHT COLUMN - PRODUCT DETAILS (COMPACT & REDUCED HEIGHT) */}
            <div className="flex flex-col rounded-3xl bg-[#141720] border border-white/10 p-5 sm:p-6 shadow-xl">

              {/* Brand, Category & Gender Row */}
              <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Tag size={15} className="text-amber-400" />
                  <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
                    {categoryName}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-gray-300 uppercase">
                    <UserCheck size={12} className="text-amber-400" />
                    {genderTag}
                  </span>
                  {product.brand && (
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                      {product.brand}
                    </span>
                  )}
                </div>
              </div>

              {/* Product Title */}
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-serif font-bold text-white mt-3">
                {product.name}
              </h1>

              {/* Rating & Stock Status */}
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1 bg-white/5 px-2.5 py-0.5 rounded-lg border border-white/10">
                  <Star size={14} className="fill-amber-400 text-amber-400" />
                  <span className="text-xs font-bold text-amber-300">{rating}</span>
                </div>

                {product.stock > 0 ? (
                  <span className="flex items-center gap-1 text-xs font-bold text-emerald-400">
                    <CheckCircle2 size={14} />
                    In Stock ({product.stock})
                  </span>
                ) : (
                  <span className="text-xs font-bold text-red-500 uppercase tracking-wide">
                    Out of Stock
                  </span>
                )}
              </div>

              {/* Price Tag Section */}
              <div className="mt-4 flex items-baseline gap-3 bg-white/5 px-4 py-2.5 rounded-xl border border-white/10">
                <span className="text-2xl sm:text-3xl font-black text-amber-400">
                  ₹{Number(offerPrice).toLocaleString("en-IN")}
                </span>

                {hasOffer && (
                  <span className="text-sm sm:text-base text-gray-400 line-through">
                    ₹{Number(originalPrice).toLocaleString("en-IN")}
                  </span>
                )}
              </div>

              {/* Description */}
              <div className="mt-4">
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed line-clamp-3">
                  {product.description ||
                    `${product.name} is a high-precision luxury watch designed with timeless craftsmanship, durable materials, and modern elegance.`}
                </p>
              </div>

              {/* Color Selector */}
              {product.colors?.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                    Color: <span className="text-amber-400">{selectedColor}</span>
                  </h3>

                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((color, index) => (
                      <button
                        key={`${color}-${index}`}
                        type="button"
                        onClick={() => setSelectedColor(color)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                          selectedColor === color
                            ? "bg-amber-400 text-black border-amber-400 shadow-md shadow-amber-500/20"
                            : "bg-white/5 text-gray-300 border-white/10 hover:border-amber-400/50"
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selector */}
              {product.size?.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                    Size
                  </h3>

                  <div className="flex flex-wrap gap-2">
                    {product.size.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                          selectedSize === size
                            ? "bg-amber-400 text-black border-amber-400 shadow-md shadow-amber-500/20"
                            : "bg-white/5 text-gray-300 border-white/10 hover:border-amber-400/50"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Counter */}
              {product.stock > 0 && (
                <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                    Quantity
                  </span>

                  <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg p-1">
                    <button
                      type="button"
                      onClick={decreaseQuantity}
                      className="p-1.5 rounded hover:bg-white/10 transition-colors text-white"
                    >
                      <Minus size={14} />
                    </button>

                    <span className="w-6 text-center text-xs font-bold text-amber-400">
                      {quantity}
                    </span>

                    <button
                      type="button"
                      onClick={increaseQuantity}
                      className="p-1.5 rounded hover:bg-white/10 transition-colors text-white"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              )}

              {/* Error / Alert Message */}
              {message && (
                <div className="mt-3 bg-red-500/20 border border-red-500/50 text-red-300 px-3 py-2 rounded-lg text-xs font-semibold">
                  {message}
                </div>
              )}

              {/* Add to Cart Button */}
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className="w-full mt-4 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-black font-extrabold py-3.5 rounded-xl text-xs uppercase tracking-[0.15em] flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingBag size={16} />
                {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
              </button>

              {/* Features / Benefits Highlights */}
              <div className="grid grid-cols-3 gap-2 border-t border-white/10 mt-5 pt-4">
                <div className="flex flex-col items-center text-center p-2 rounded-lg bg-white/5 border border-white/5">
                  <ShieldCheck size={18} className="text-amber-400 mb-0.5" />
                  <span className="text-[10px] font-bold text-white">1 Yr Warranty</span>
                </div>

                <div className="flex flex-col items-center text-center p-2 rounded-lg bg-white/5 border border-white/5">
                  <Truck size={18} className="text-amber-400 mb-0.5" />
                  <span className="text-[10px] font-bold text-white">Express Delivery</span>
                </div>

                <div className="flex flex-col items-center text-center p-2 rounded-lg bg-white/5 border border-white/5">
                  <RotateCcw size={18} className="text-amber-400 mb-0.5" />
                  <span className="text-[10px] font-bold text-white">Easy Returns</span>
                </div>
              </div>

            </div>

          </div>

          {/* BRAND PROMISE SECTION */}
          <section className="mt-12 bg-[#141720] border border-white/10 rounded-2xl p-6 text-center">
            <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-amber-400">
              Time Aura Commitment
            </span>

            <h2 className="text-xl sm:text-2xl font-serif font-bold text-white mt-1.5">
              Crafted For Extraordinary Moments
            </h2>

            <p className="text-xs sm:text-sm text-gray-400 mt-2 max-w-xl mx-auto leading-relaxed">
              Every Time Aura timepiece represents sophisticated engineering, high-grade components, and a passion for luxury style.
            </p>
          </section>

        </main>

        {/* FOOTER */}
        <footer className="bg-[#0a0b0e] border-t border-white/10 py-6 px-6 mt-12 text-center">
          <h2 className="text-base font-serif font-bold tracking-[0.25em] text-amber-400">
            TIME AURA
          </h2>
          <p className="text-[11px] text-gray-500 mt-1 uppercase tracking-widest">
            Timeless Elegance & Precision
          </p>
          <p className="text-[10px] text-gray-600 mt-3">
            © {new Date().getFullYear()} Time Aura. All rights reserved.
          </p>
        </footer>

      </div>
    </>
  );
}