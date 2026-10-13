"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";
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
        console.log("SHOP PRODUCTS:", data);

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
        console.log("SHOP LANDING:", data);

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
            typeof product === "string"
              ? product
              : product?._id
          )
          .filter(Boolean);

        setWishlist(wishlistIds);
      } catch (error) {
        console.error("FETCH WISHLIST ERROR:", error);
      }
    };

    fetchWishlist();
  }, []);

  // SYNC WISHLIST WITH NAVBAR AND OTHER COMPONENTS
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
            typeof product === "string"
              ? product
              : product?._id
          )
          .filter(Boolean);

        setWishlist(wishlistIds);
      } catch (error) {
        console.error("SYNC WISHLIST ERROR:", error);
      }
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

  // CATEGORY FILTER
  const filteredProducts =
    category === "All"
      ? products
      : products.filter(
          (product) =>
            product.category?.toLowerCase() ===
            category.toLowerCase()
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

  // WISHLIST
  const handleWishlist = async (productId) => {
    setMessage("");

    const alreadyWishlisted = wishlist.some(
      (id) => id?.toString() === productId?.toString()
    );

    // Optimistic UI update
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

      // Login required
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

      // API error
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

      // Apply server-confirmed action
      if (data.action === "added") {
        setWishlist((current) =>
          current.some(
            (id) => id?.toString() === productId?.toString()
          )
            ? current
            : [...current, productId]
        );
      }

      if (data.action === "removed") {
        setWishlist((current) =>
          current.filter(
            (id) => id?.toString() !== productId?.toString()
          )
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

    const selectedSize = product.size?.length
      ? product.size[0]
      : "";

    const selectedColor = product.colors?.length
      ? product.colors[0]
      : "";

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
        setMessage(
          data.message || "Unable to add product to cart."
        );
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
    <main className="min-h-screen bg-[#0c0c01] text-white">
      <Navbar />

      {/* PAGE HEADER */}
      <section className="px-6 pb-12 pt-20 md:px-12">
        <div className="mx-auto max-w-7xl text-center">
          <p className="mb-4 text-[10px] font-medium uppercase tracking-[0.5em] text-gray-400">
            Time Aura
          </p>

          <h1 className="font-serif text-5xl font-normal tracking-tight text-[#f5f5f0] md:text-7xl">
            Watch Collection
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-sm font-light leading-7 tracking-wide text-gray-400 md:text-base">
            Discover timeless watches crafted for those who
            appreciate elegance, precision and style.
          </p>
        </div>
      </section>

      {/* CATEGORY FILTER */}
      <section className="px-6 md:px-12">
        <div className="mx-auto flex max-w-7xl flex-wrap justify-center gap-3 border-b border-[#222215] pb-8">
          {["All", "Luxury", "Classic", "Sport", "Smart"].map(
            (item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                className={`rounded-full border px-6 py-2 text-[11px] uppercase tracking-[0.15em] transition-all duration-300 ${
                  category === item
                    ? "border-[#f5f5f0] bg-[#f5f5f0] text-[#0c0c01]"
                    : "border-[#333322] bg-transparent text-gray-300 hover:border-[#f5f5f0] hover:text-white"
                }`}
              >
                {item}
              </button>
            )
          )}
        </div>
      </section>

      {/* SHOP AD VIDEO */}
      {!adVideoLoading && adVideo && (
        <section className="px-6 pt-10 md:px-12 md:pt-12">
          <div className="mx-auto max-w-5xl">
            <div className="overflow-hidden border border-[#333322] bg-[#16160b]">
              <video
                src={adVideo}
                autoPlay
                muted
                loop
                playsInline
                controls={false}
                className="h-[220px] w-full object-cover md:h-[400px]"
              />
            </div>
          </div>
        </section>
      )}

      {/* WHITE PRODUCT SECTION + WHITE FOOTER AREA */}
      <div className="mt-0 bg-white text-black">
        <section className="px-6 py-14 md:px-12">
          <div className="mx-auto max-w-7xl">
            {/* MESSAGE */}
            {message && (
              <div className="mb-6 flex justify-center">
                <p className="border border-gray-200 bg-white px-5 py-2.5 text-sm text-gray-700 shadow-sm">
                  {message}
                </p>
              </div>
            )}

            {/* LOADING */}
            {loading && (
              <div className="flex min-h-[300px] items-center justify-center">
                <p className="text-[11px] uppercase tracking-[0.25em] text-gray-500">
                  Loading watches...
                </p>
              </div>
            )}

            {/* NO PRODUCTS */}
            {!loading && filteredProducts.length === 0 && (
              <div className="flex min-h-[300px] items-center justify-center">
                <div className="text-center">
                  <h2 className="font-serif text-2xl font-normal text-black">
                    No watches found
                  </h2>

                  <p className="mt-3 text-sm font-light tracking-wide text-gray-500">
                    Check another category.
                  </p>
                </div>
              </div>
            )}

            {/* PRODUCT GRID */}
            {!loading && filteredProducts.length > 0 && (
              <div className="grid grid-cols-1 gap-x-7 gap-y-14 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredProducts.map((product) => {
                  const productImage = getProductImage(product);
                  const displayPrice =
                    product.offerPrice ?? product.price;

                  const isWishlisted = wishlist.some(
                    (id) =>
                      id?.toString() === product._id?.toString()
                  );

                  return (
                    <div
                      key={product._id}
                      className="group overflow-hidden border border-white bg-white p-4 text-black shadow-sm transition-all duration-500 hover:-translate-y-1 hover:border-gray-300 hover:shadow-lg"
                    >
                      {/* PRODUCT IMAGE */}
                      <Link
                        href={`/shop/${product._id}`}
                        className="block"
                      >
                        <div className="relative aspect-square overflow-hidden bg-gray-100">
                          <img
                            src={productImage}
                            alt={product.name}
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />

                          {product.stock === 0 && (
                            <div className="absolute left-4 top-4 border border-gray-300 bg-white px-3 py-1.5 text-[9px] uppercase tracking-[0.2em] text-black">
                              Sold Out
                            </div>
                          )}
                        </div>
                      </Link>

                      {/* PRODUCT DETAILS */}
                      <div className="pt-5">
                        <p className="text-[9px] font-medium uppercase tracking-[0.35em] text-gray-500">
                          {product.brand}
                        </p>

                        <Link href={`/shop/${product._id}`}>
                          <h2 className="mt-4 font-serif text-2xl font-normal tracking-tight text-black transition-colors hover:text-gray-500">
                            {product.name}
                          </h2>
                        </Link>

                        <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-gray-500">
                          {product.category}
                        </p>

                        {product.gender && (
                          <p className="mt-2 text-[10px] uppercase tracking-[0.15em] text-gray-500">
                            {product.gender}
                          </p>
                        )}

                        {product.colors?.length > 0 && (
                          <p className="mt-2 text-[10px] tracking-wide text-gray-500">
                            Available:{" "}
                            <span className="text-gray-800">
                              {product.colors.join(", ")}
                            </span>
                          </p>
                        )}

                        {/* PRICE + ACTIONS */}
                        <div className="mt-5 flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold tracking-wide text-black">
                            ₹
                            {Number(displayPrice).toLocaleString(
                              "en-IN"
                            )}
                          </p>

                          <div className="flex items-center gap-2">
                            {/* WISHLIST */}
                            <button
                              type="button"
                              onClick={() =>
                                handleWishlist(product._id)
                              }
                              className={`flex h-9 w-9 shrink-0 items-center justify-center border transition-all duration-300 ${
                                isWishlisted
                                  ? "border-red-500 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white"
                                  : "border-gray-300 bg-white text-black hover:border-black hover:bg-black hover:text-white"
                              }`}
                              aria-label={
                                isWishlisted
                                  ? "Remove from wishlist"
                                  : "Add to wishlist"
                              }
                            >
                              <Heart
                                size={15}
                                strokeWidth={1.7}
                                fill={
                                  isWishlisted
                                    ? "currentColor"
                                    : "none"
                                }
                              />
                            </button>

                            {/* CART */}
                            <button
                              type="button"
                              disabled={product.stock === 0}
                              onClick={() =>
                                handleAddToCart(product)
                              }
                              className="flex h-9 w-9 shrink-0 items-center justify-center border border-gray-300 bg-white text-black transition-all duration-300 hover:border-black hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                              aria-label="Add to cart"
                            >
                              <ShoppingBag
                                size={15}
                                strokeWidth={1.5}
                              />
                            </button>

                            {/* VIEW */}
                            <Link
                              href={`/shop/${product._id}`}
                              className={`border border-black px-4 py-2.5 text-center text-[9px] uppercase tracking-[0.2em] text-black transition-all duration-300 hover:bg-black hover:text-white ${
                                product.stock === 0
                                  ? "pointer-events-none cursor-not-allowed opacity-40"
                                  : ""
                              }`}
                            >
                              View
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        <Footer />
      </div>
    </main>
  );
}
