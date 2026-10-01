"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Heart, ShoppingBag, Trash2, ArrowLeft, Sparkles } from "lucide-react";

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
        // Normalize data whether items are direct product objects or populated
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
        // Instantly remove item from local state
        setWishlistItems((prev) =>
          prev.filter((item) => item._id !== productId)
        );

        // Notify Navbar to update the count immediately
        window.dispatchEvent(new Event("wishlistUpdated"));
      }
    } catch (error) {
      console.error("Error removing from wishlist:", error);
    }
  };

  // =========================
  // ADD TO CART
  // =========================
  const handleAddToCart = async (productId) => {
    try {
      const response = await axios.post(
        "/api/cart",
        { productId, quantity: 1 },
        { withCredentials: true }
      );

      if (response.data.success) {
        alert("Added to cart successfully!");
      }
    } catch (error) {
      if (error.response?.status === 401) {
        router.push("/auth");
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f8f1] px-5 py-12 md:px-10 lg:px-16">
      <div className="mx-auto max-w-7xl">
        {/* Navigation / Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/shop"
              className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500 transition hover:text-black"
            >
              <ArrowLeft size={16} />
              Continue Shopping
            </Link>
            <h1 className="text-3xl font-bold tracking-tight text-black md:text-4xl">
              My Wishlist
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {wishlistItems.length}{" "}
              {wishlistItems.length === 1 ? "saved watch" : "saved watches"}
            </p>
          </div>
        </div>

        {/* Skeleton Loader */}
        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="h-[360px] animate-pulse rounded-2xl bg-gray-200"
              />
            ))}
          </div>
        ) : wishlistItems.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-gray-300 bg-white px-6 py-20 text-center shadow-sm">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500">
              <Heart size={30} />
            </div>
            <h2 className="mt-5 text-xl font-semibold text-gray-900">
              Your Wishlist is Empty
            </h2>
            <p className="mt-2 max-w-md text-sm text-gray-500">
              Explore our collection of luxury timepieces and tap the heart icon on any watch to save your favorites here.
            </p>
            <Link
              href="/shop"
              className="mt-6 flex items-center gap-2 rounded-xl bg-black px-6 py-3.5 text-sm font-semibold text-white transition duration-200 hover:bg-gray-800"
            >
              <Sparkles size={16} />
              Explore Watches
            </Link>
          </div>
        ) : (
          /* Wishlist Items Grid */
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {wishlistItems.map((product) => (
              <div
                key={product._id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                {/* Image Container */}
                <div>
                  <div className="relative h-[210px] w-full overflow-hidden bg-[#f3f3ee]">
                    

                    {/* Delete / Remove Button */}
                    <button
                      type="button"
                      onClick={() => handleRemoveFromWishlist(product._id)}
                      title="Remove from wishlist"
                      aria-label="Remove item"
                      className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-gray-600 shadow-md backdrop-blur-sm transition hover:bg-red-50 hover:text-red-600 active:scale-95"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>

                  {/* Details */}
                  <div className="p-5">
                    {product.brand && (
                      <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                        {product.brand}
                      </p>
                    )}
                    <h3 className="mt-1 truncate text-base font-semibold text-gray-900">
                      {product.name}
                    </h3>
                    <p className="mt-1 text-xs text-gray-500">
                      {product.size}
                    </p>

                    <div className="mt-4">
                      <span className="text-lg font-bold tracking-tight text-black">
                        ₹{product.price}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Add To Cart Button */}
                <div className="p-5 pt-0">
                  <button
                    type="button"
                    onClick={() => handleAddToCart(product._id)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white transition duration-200 hover:bg-gray-800 active:scale-[0.98]"
                  >
                    <ShoppingBag size={16} />
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}