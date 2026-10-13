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

  // =====================================================
  // STATES
  // =====================================================

  const [cartItems, setCartItems] = useState([]);

  const [loading, setLoading] = useState(true);

  const [message, setMessage] = useState("");

  const [error, setError] = useState("");

  const [updatingId, setUpdatingId] = useState(null);

  // =====================================================
  // GET PRODUCT PRICE
  // =====================================================

  const getPrice = (product) => {
    if (!product) {
      return 0;
    }

    return Number(
      product.offerPrice ??
        product.price ??
        product.mrp ??
        0
    );
  };

  // =====================================================
  // FETCH CART
  // =====================================================

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

      // -------------------------------------------------
      // LOGIN REQUIRED
      // -------------------------------------------------

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

  // =====================================================
  // INITIAL FETCH
  // =====================================================

  useEffect(() => {
    fetchCart();
  }, []);

  // =====================================================
  // UPDATE QUANTITY
  // =====================================================

  const updateQuantity = async (
    item,
    newQuantity
  ) => {
    // Quantity cannot be less than 1
    if (newQuantity < 1) {
      return;
    }

    // Cart item ID required
    if (!item?._id) {
      return;
    }

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
        {
          withCredentials: true,
        }
      );

      if (res.data.success) {
        // Update cart with backend response
        setCartItems(res.data.items || []);

        // Update Navbar cart count
        window.dispatchEvent(
          new Event("cartUpdated")
        );
      }
    } catch (error) {
      console.error(
        "Update quantity error:",
        error.response?.data || error.message
      );

      // -------------------------------------------------
      // LOGIN REQUIRED
      // -------------------------------------------------

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

  // =====================================================
  // REMOVE ONE CART ITEM
  // =====================================================

  const removeItem = async (cartItemId) => {
    if (!cartItemId) {
      return;
    }

    setUpdatingId(cartItemId);

    setMessage("");

    setError("");

    try {
      const res = await axios.delete(
        "/api/cart",
        {
          data: {
            cartItemId,
          },
          withCredentials: true,
        }
      );

      if (res.data.success) {
        // ------------------------------------------------
        // IMPORTANT
        // ------------------------------------------------
        // Backend returns the remaining cart items.
        //
        // Example:
        //
        // Before:
        // Rolex
        // Omega
        // Tissot
        //
        // Delete Rolex:
        //
        // Omega
        // Tissot
        //
        // Only the deleted product disappears.
        // Remaining products stay on this page.
        // ------------------------------------------------

        setCartItems(res.data.items || []);

        // Update Navbar cart count
        window.dispatchEvent(
          new Event("cartUpdated")
        );

        // No router.push() here.
        // User stays on /cart.
      }
    } catch (error) {
      console.error(
        "Remove cart item error:",
        error.response?.data || error.message
      );

      // -------------------------------------------------
      // LOGIN REQUIRED
      // -------------------------------------------------

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

  // =====================================================
  // SUBTOTAL
  // =====================================================

  const subtotal = cartItems.reduce(
    (total, item) => {
      const product = item.product;

      const price = getPrice(product);

      const quantity = Number(
        item.quantity || 0
      );

      return total + price * quantity;
    },
    0
  );

  // =====================================================
  // TOTAL QUANTITY
  // =====================================================

  const totalQuantity = cartItems.reduce(
    (total, item) => {
      return (
        total +
        Number(item.quantity || 0)
      );
    },
    0
  );

  // =====================================================
  // LOADING UI
  // =====================================================

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F8F8F1] px-6 py-32">
        <div className="mx-auto max-w-7xl">

          {/* Header skeleton */}

          <div className="mb-10">
            <div className="h-3 w-24 animate-pulse rounded bg-gray-200" />

            <div className="mt-4 h-10 w-48 animate-pulse rounded bg-gray-200" />

            <div className="mt-3 h-4 w-40 animate-pulse rounded bg-gray-200" />
          </div>

          {/* Content skeleton */}

          <div className="grid gap-8 lg:grid-cols-[1fr_380px]">

            {/* Cart item skeletons */}

            <div className="space-y-4">

              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-40 animate-pulse rounded-xl bg-white"
                />
              ))}

            </div>

            {/* Summary skeleton */}

            <div className="h-72 animate-pulse rounded-xl bg-white" />

          </div>
        </div>
      </main>
    );
  }

  // =====================================================
  // EMPTY CART
  // =====================================================
  //
  // This UI appears ONLY when all products
  // have been removed from the cart.
  //
  // If one or more products remain,
  // this section will NOT execute.
  // =====================================================

  if (cartItems.length === 0) {
    return (
      <main className="min-h-screen bg-[#F8F8F1] px-6 py-32">

        <div className="mx-auto flex max-w-7xl flex-col items-center justify-center text-center">

          {/* Empty cart icon */}

          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white">
            <ShoppingBag
              size={32}
              strokeWidth={1.5}
              className="text-gray-700"
            />
          </div>

          {/* Heading */}

          <h1 className="mt-6 text-3xl font-semibold text-black">
            Your Cart is Empty
          </h1>

          {/* Description */}

          <p className="mt-3 max-w-md text-sm text-gray-500">
            You haven't added any watches
            to your cart yet.
          </p>

          {/* Continue Shopping */}

          <Link
            href="/"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-black px-7 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            <ArrowLeft size={16} />

            Continue Shopping
          </Link>

        </div>
      </main>
    );
  }

  // =====================================================
  // CART PAGE
  // =====================================================

  return (
    <main className="min-h-screen bg-[#F8F8F1] px-6 pb-20 pt-32">

      <div className="mx-auto max-w-7xl">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-10">

          <p className="text-xs uppercase tracking-[0.3em] text-gray-500">
            Shopping Bag
          </p>

          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-black">
            Your Cart
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            {cartItems.length}{" "}
            {cartItems.length === 1
              ? "product"
              : "products"}{" "}
            · {totalQuantity}{" "}
            {totalQuantity === 1
              ? "item"
              : "items"}
          </p>

        </div>

        {/* =================================================
            SUCCESS MESSAGE
        ================================================= */}

        {message && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {message}
          </div>
        )}

        {/* =================================================
            ERROR MESSAGE
        ================================================= */}

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* =================================================
            CONTENT
        ================================================= */}

        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">

          {/* =================================================
              CART ITEMS
          ================================================= */}

          <div className="space-y-4">

            {cartItems.map((item) => {

              const product = item.product;

              // Product missing
              if (!product) {
                return null;
              }

              // Product price
              const price = getPrice(product);

              // Quantity
              const quantity = Number(
                item.quantity || 0
              );

              // Item total
              const itemTotal =
                price * quantity;

              // Product image
              const image =
                product.images?.[0] ||
                product.image ||
                "/placeholder-watch.jpg";

              return (
                <div
                  key={item._id}
                  className="rounded-xl bg-white p-5"
                >

                  <div className="flex gap-5">

                    {/* =================================================
                        PRODUCT IMAGE
                    ================================================= */}

                    <div className="h-32 w-32 shrink-0 overflow-hidden rounded-lg bg-[#F5F5F0]">

                      <img
                        src={image}
                        alt={
                          product.name ||
                          "Watch"
                        }
                        className="h-full w-full object-cover"
                      />

                    </div>

                    {/* =================================================
                        PRODUCT DETAILS
                    ================================================= */}

                    <div className="flex min-w-0 flex-1 flex-col justify-between">

                      {/* TOP */}

                      <div>

                        <div className="flex items-start justify-between gap-4">

                          {/* Brand + Name */}

                          <div>

                            <p className="text-xs uppercase tracking-wider text-gray-400">
                              {product.brand ||
                                "Time Aura"}
                            </p>

                            <h2 className="mt-1 text-lg font-medium text-black">
                              {product.name}
                            </h2>

                          </div>

                          {/* =================================================
                              DELETE BUTTON
                          ================================================= */}

                          <button
                            type="button"
                            onClick={() =>
                              removeItem(
                                item._id
                              )
                            }
                            disabled={
                              updatingId ===
                              item._id
                            }
                            aria-label="Remove product"
                            className="text-gray-400 transition hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <Trash2
                              size={18}
                            />
                          </button>

                        </div>

                        {/* =================================================
                            SIZE
                        ================================================= */}

                        <p className="mt-2 text-sm text-gray-500">
                          Size:{" "}
                          <span className="font-medium text-gray-700">
                            {item.size}
                          </span>
                        </p>

                      </div>

                      {/* =================================================
                          BOTTOM
                      ================================================= */}

                      <div className="mt-5 flex items-center justify-between">

                        {/* =================================================
                            QUANTITY
                        ================================================= */}

                        <div className="flex items-center rounded-full border border-gray-200">

                          {/* MINUS */}

                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(
                                item,
                                quantity - 1
                              )
                            }
                            disabled={
                              updatingId ===
                                item._id ||
                              quantity <= 1
                            }
                            aria-label="Decrease quantity"
                            className="flex h-9 w-9 items-center justify-center text-gray-600 transition hover:text-black disabled:cursor-not-allowed disabled:opacity-30"
                          >
                            <Minus
                              size={15}
                            />
                          </button>

                          {/* QUANTITY */}

                          <span className="w-8 text-center text-sm font-medium">
                            {quantity}
                          </span>

                          {/* PLUS */}

                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(
                                item,
                                quantity + 1
                              )
                            }
                            disabled={
                              updatingId ===
                              item._id
                            }
                            aria-label="Increase quantity"
                            className="flex h-9 w-9 items-center justify-center text-gray-600 transition hover:text-black disabled:cursor-not-allowed disabled:opacity-30"
                          >
                            <Plus
                              size={15}
                            />
                          </button>

                        </div>

                        {/* =================================================
                            PRICE
                        ================================================= */}

                        <div className="text-right">

                          <p className="text-lg font-semibold text-black">
                            ₹
                            {itemTotal.toLocaleString(
                              "en-IN"
                            )}
                          </p>

                          {quantity > 1 && (
                            <p className="mt-1 text-xs text-gray-400">
                              ₹
                              {price.toLocaleString(
                                "en-IN"
                              )}{" "}
                              each
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

          {/* =================================================
              ORDER SUMMARY
          ================================================= */}

          <div className="h-fit rounded-xl bg-white p-6 lg:sticky lg:top-28">

            <h2 className="text-xl font-semibold text-black">
              Order Summary
            </h2>

            {/* =================================================
                SUBTOTAL
            ================================================= */}

            <div className="mt-6 flex items-center justify-between text-sm">

              <span className="text-gray-500">
                Subtotal
              </span>

              <span className="font-medium text-black">
                ₹
                {subtotal.toLocaleString(
                  "en-IN"
                )}
              </span>

            </div>

            {/* =================================================
                SHIPPING
            ================================================= */}

            <div className="mt-4 flex items-center justify-between text-sm">

              <span className="text-gray-500">
                Shipping
              </span>

              <span className="font-medium text-green-600">
                Free
              </span>

            </div>

            {/* =================================================
                DIVIDER
            ================================================= */}

            <div className="my-6 border-t border-gray-200" />

            {/* =================================================
                TOTAL
            ================================================= */}

            <div className="flex items-center justify-between">

              <span className="text-base font-semibold text-black">
                Total
              </span>

              <span className="text-xl font-semibold text-black">
                ₹
                {subtotal.toLocaleString(
                  "en-IN"
                )}
              </span>

            </div>

            {/* =================================================
                CHECKOUT
            ================================================= */}

            <button
              type="button"
              onClick={() =>
                router.push("/checkout")
              }
              className="mt-7 w-full rounded-full bg-black py-4 text-sm font-medium text-white transition hover:bg-gray-800"
            >
              Proceed to Checkout
            </button>

            {/* =================================================
                CONTINUE SHOPPING
            ================================================= */}

            <Link
              href="/Shop"
              className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500 transition hover:text-black"
            >
              <ArrowLeft size={15} />

              Continue Shopping
            </Link>

          </div>

        </div>

      </div>

    </main>
  );
}