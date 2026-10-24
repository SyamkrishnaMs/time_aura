"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";

import {
  Search,
  ShoppingBag,
  Heart,
  User,
  ChevronDown,
  Package,
  Settings,
  Flag,
  LogOut,
} from "lucide-react";

export default function Navbar() {
  const router = useRouter();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [userName, setUserName] = useState("");

  const [wishlistCount, setWishlistCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);

  // FETCH WISHLIST COUNT
  const fetchWishlistCount = async () => {
    try {
      const res = await axios.get("/api/wishlist", {
        withCredentials: true,
      });

      if (res.data.success) {
        setWishlistCount(res.data.count || 0);
      }
    } catch (error) {
      setWishlistCount(0);
    }
  };

  // FETCH CART COUNT
  const fetchCartCount = async () => {
    try {
      const res = await axios.get("/api/cart", {
        withCredentials: true,
      });

      if (res.data.success) {
        setCartCount(res.data.count || 0);
      }
    } catch (error) {
      setCartCount(0);
    }
  };

  // CHECK LOGIN AND BLOCK STATUS
  const checkAuth = async () => {
    try {
      const res = await axios.get("/api/auth/me", {
        withCredentials: true,
      });

      if (res.data.success) {
        setIsLoggedIn(true);
        setUserName(res.data.user.name || "User");

        await Promise.all([
          fetchWishlistCount(),
          fetchCartCount(),
        ]);

        return;
      }

      setIsLoggedIn(false);
      setUserName("");
      setWishlistCount(0);
      setCartCount(0);
    } catch (error) {
      if (
        axios.isAxiosError(error) &&
        error.response?.status === 403 &&
        error.response?.data?.blocked
      ) {
        setIsLoggedIn(false);
        setUserName("");
        setWishlistCount(0);
        setCartCount(0);
        setShowProfile(false);

        router.push("/blocked");
        return;
      }

      setIsLoggedIn(false);
      setUserName("");
      setWishlistCount(0);
      setCartCount(0);
    }
  };

  // INITIAL AUTH CHECK
  useEffect(() => {
    checkAuth();
  }, []);

  // CHECK BLOCK STATUS EVERY 30 SECONDS
  useEffect(() => {
    if (!isLoggedIn) return;

    const interval = setInterval(() => {
      checkAuth();
    }, 30000);

    return () => clearInterval(interval);
  }, [isLoggedIn]);

  // LISTEN FOR WISHLIST UPDATES
  useEffect(() => {
    const handleWishlistUpdated = () => {
      if (isLoggedIn) {
        fetchWishlistCount();
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
  }, [isLoggedIn]);

  // LISTEN FOR CART UPDATES
  useEffect(() => {
    const handleCartUpdated = () => {
      if (isLoggedIn) {
        fetchCartCount();
      }
    };

    window.addEventListener(
      "cartUpdated",
      handleCartUpdated
    );

    return () => {
      window.removeEventListener(
        "cartUpdated",
        handleCartUpdated
      );
    };
  }, [isLoggedIn]);

  // LOGOUT
  const handleLogout = async () => {
    try {
      const res = await axios.post(
        "/api/auth/logout",
        {},
        { withCredentials: true }
      );

      if (res.data.success) {
        setIsLoggedIn(false);
        setUserName("");
        setWishlistCount(0);
        setCartCount(0);
        setShowProfile(false);

        router.push("/auth");
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // SIGN UP / LOGIN
  const handleSign = () => {
    router.push("/auth");
  };

  // WISHLIST
  const handleWishlist = () => {
    if (!isLoggedIn) {
      router.push("/auth");
      return;
    }

    router.push("/wishlist");
  };

  // CART
  const handleCart = (e) => {
    if (!isLoggedIn) {
      e.preventDefault();
      router.push("/auth");
    }
  };

  return (
    <nav className="absolute left-0 top-0 z-50 w-full px-8 py-6 bg-gradient-to-b from-[#0a0b0e]/90 to-transparent backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between">

        {/* LOGO */}
        <Link
          href="/"
          className="flex items-center gap-2 text-base font-semibold text-white group"
        >
          <span className="text-2xl text-amber-400 transition group-hover:rotate-45 duration-300">✧</span>
          <span className="font-serif text-2xl font-bold tracking-wider text-white">Time Aura</span>
        </Link>

        {/* NAVIGATION */}
        <div className="hidden items-center gap-9 md:flex">
          <Link
            href="/#home"
            className="text-sm font-bold uppercase tracking-widest text-gray-300 transition hover:text-amber-400"
          >
            Home
          </Link>

          <Link
            href="/shop"
            className="text-sm font-bold uppercase tracking-widest text-gray-300 transition hover:text-amber-400"
          >
            Shop
          </Link>

          <Link
            href="/#feature"
            className="text-sm font-bold uppercase tracking-widest text-gray-300 transition hover:text-amber-400"
          >
            Feature
          </Link>

          <Link
            href="/#about"
            className="text-sm font-bold uppercase tracking-widest text-gray-300 transition hover:text-amber-400"
          >
            About
          </Link>

          <Link
            href="/#contact"
            className="text-sm font-bold uppercase tracking-widest text-gray-300 transition hover:text-amber-400"
          >
            Contact
          </Link>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-6">

          {/* SEARCH */}
          <button
            type="button"
            className="text-white transition hover:text-amber-400"
            aria-label="Search"
          >
            <Search size={20} strokeWidth={1.8} />
          </button>

          {/* WISHLIST */}
          <button
            type="button"
            onClick={handleWishlist}
            className="relative text-white transition hover:text-amber-400"
            aria-label="Wishlist"
          >
            <Heart size={20} strokeWidth={1.8} />

            {isLoggedIn && wishlistCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-400 px-1 text-[10px] font-black text-black shadow-md shadow-amber-500/40">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* CART */}
          <Link
            href="/cart"
            onClick={handleCart}
            className="relative text-white transition hover:text-amber-400"
            aria-label="Cart"
          >
            <ShoppingBag size={20} strokeWidth={1.8} />

            {isLoggedIn && cartCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-400 px-1 text-[10px] font-black text-black shadow-md shadow-amber-500/40">
                {cartCount}
              </span>
            )}
          </Link>

          {/* LOGGED-IN USER */}
          {isLoggedIn ? (
            <div className="relative">

              {/* PROFILE BUTTON */}
              <button
                type="button"
                onClick={() =>
                  setShowProfile((prev) => !prev)
                }
                className="flex items-center gap-2.5 text-white transition hover:text-amber-400"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-amber-400/40 bg-amber-400/10 backdrop-blur-sm text-amber-400 shadow-sm">
                  <User size={18} />
                </div>

                <span className="hidden text-xs font-bold uppercase tracking-wider sm:inline-block text-gray-200">
                  {userName}
                </span>

                <ChevronDown
                  size={16}
                  className={`text-amber-400 transition-transform duration-300 ${
                    showProfile ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* PROFILE DROPDOWN */}
              {showProfile && (
                <div className="absolute right-0 top-12 w-60 overflow-hidden rounded-2xl border border-amber-400/30 bg-[#12151d] text-white shadow-2xl backdrop-blur-xl">

                  <button
                    type="button"
                    onClick={() => {
                      router.push("/profile");
                      setShowProfile(false);
                    }}
                    className="flex w-full items-center gap-3 px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-300 transition hover:bg-amber-400/10 hover:text-amber-400"
                  >
                    <User size={16} className="text-amber-400" />
                    <span>My Profile</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      router.push("/my_order");
                      setShowProfile(false);
                    }}
                    className="flex w-full items-center gap-3 px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-300 transition hover:bg-amber-400/10 hover:text-amber-400"
                  >
                    <Package size={16} className="text-amber-400" />
                    <span>My Orders</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      router.push("/wishlist");
                      setShowProfile(false);
                    }}
                    className="flex w-full items-center justify-between px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-300 transition hover:bg-amber-400/10 hover:text-amber-400"
                  >
                    <div className="flex items-center gap-3">
                      <Heart size={16} className="text-amber-400" />
                      <span>Wishlist</span>
                    </div>

                    {wishlistCount > 0 && (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-400 px-1.5 text-[10px] font-black text-black">
                        {wishlistCount}
                      </span>
                    )}
                  </button>

                  <div className="my-1 border-t border-white/10" />

                  <button
                    type="button"
                    onClick={() => {
                      router.push("/settings");
                      setShowProfile(false);
                    }}
                    className="flex w-full items-center gap-3 px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-300 transition hover:bg-amber-400/10 hover:text-amber-400"
                  >
                    <Settings size={16} className="text-amber-400" />
                    <span>Settings</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      router.push("/report");
                      setShowProfile(false);
                    }}
                    className="flex w-full items-center gap-3 px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-300 transition hover:bg-amber-400/10 hover:text-amber-400"
                  >
                    <Flag size={16} className="text-amber-400" />
                    <span>Report a Problem</span>
                  </button>

                  <div className="my-1 border-t border-white/10" />

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-red-400 transition hover:bg-red-500/10"
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={handleSign}
              className="rounded-full border border-amber-400/50 bg-gradient-to-r from-amber-500 to-yellow-600 px-6 py-2.5 text-xs font-extrabold uppercase tracking-widest text-black shadow-lg shadow-amber-500/20 backdrop-blur-sm transition hover:from-amber-400 hover:to-yellow-500 active:scale-95"
            >
              Sign Up
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}