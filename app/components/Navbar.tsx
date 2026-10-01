
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

  // =========================
  // FETCH WISHLIST COUNT
  // =========================

  const fetchWishlistCount = async () => {
    try {
      const res = await axios.get("/api/wishlist", {
        withCredentials: true,
      });

      if (res.data.success) {
        setWishlistCount(res.data.count);
      }
    } catch (error) {
      setWishlistCount(0);
    }
  };

  // =========================
  // CHECK LOGIN & BLOCK STATUS
  // =========================

  const checkAuth = async () => {
    try {
      const res = await axios.get("/api/auth/me", {
        withCredentials: true,
      });

      if (res.data.success) {
        setIsLoggedIn(true);
        setUserName(res.data.user.name || "User");

        fetchWishlistCount();
      }
    } catch (error) {
      // =========================
      // CHECK IF USER IS BLOCKED
      // =========================

      if (
        error.response?.status === 403 &&
        error.response?.data?.blocked
      ) {
        setIsLoggedIn(false);
        setUserName("");
        setWishlistCount(0);
        setShowProfile(false);

        router.push("/blocked");
        return;
      }

      // =========================
      // NORMAL LOGOUT / NO LOGIN
      // =========================

      setIsLoggedIn(false);
      setUserName("");
      setWishlistCount(0);
    }
  };

  // =========================
  // INITIAL AUTH CHECK
  // =========================

  useEffect(() => {
    checkAuth();
  }, []);

  // =========================
  // CHECK BLOCK STATUS PERIODICALLY
  // =========================

  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }

    const interval = setInterval(() => {
      checkAuth();
    }, 30000);

    return () => {
      clearInterval(interval);
    };
  }, [isLoggedIn]);

  // =========================
  // LISTEN FOR WISHLIST UPDATES
  // =========================

  useEffect(() => {
    window.addEventListener(
      "wishlistUpdated",
      fetchWishlistCount
    );

    return () => {
      window.removeEventListener(
        "wishlistUpdated",
        fetchWishlistCount
      );
    };
  }, []);

  // =========================
  // LOGOUT
  // =========================

  const handleLogout = async () => {
    try {
      const res = await axios.post(
        "/api/auth/logout",
        {},
        {
          withCredentials: true,
        }
      );

      const data = res.data;

      if (data.success) {
        setIsLoggedIn(false);
        setUserName("");
        setWishlistCount(0);
        setShowProfile(false);

        router.push("/auth");
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // =========================
  // SIGN UP / LOGIN
  // =========================

  const handleSign = () => {
    router.push("/auth");
  };

  // =========================
  // WISHLIST
  // =========================

  const handleWishlist = () => {
    if (!isLoggedIn) {
      router.push("/auth");
      return;
    }

    router.push("/wishlist");
  };

  return (
    <nav className="absolute left-0 top-0 z-50 w-full px-8 py-6">
      <div className="mx-auto flex max-w-7xl items-center justify-between">

        {/* =========================
            LOGO
        ========================= */}

        <Link
          href="/"
          className="flex items-center gap-2 text-base font-semibold text-white"
        >
          <span className="text-2xl">✧</span>
          <span className="text-2xl">Time Aura</span>
        </Link>

        {/* =========================
            NAVIGATION
        ========================= */}

        <div className="hidden items-center gap-9 md:flex">

          <Link
            href="/#home"
            className="text-lg font-medium text-white transition hover:text-gray-300"
          >
            Home
          </Link>

          <Link
            href="/shop"
            className="text-lg font-medium text-white transition hover:text-gray-300"
          >
            Shop
          </Link>

          <Link
            href="/#feature"
            className="text-lg font-medium text-white transition hover:text-gray-300"
          >
            Feature
          </Link>

          <Link
            href="/#about"
            className="text-lg font-medium text-white transition hover:text-gray-300"
          >
            About
          </Link>

          <Link
            href="/#contact"
            className="text-lg font-medium text-white transition hover:text-gray-300"
          >
            Contact
          </Link>

        </div>

        {/* =========================
            RIGHT SIDE
        ========================= */}

        <div className="flex items-center gap-6">

          {/* SEARCH */}

          <button
            type="button"
            className="text-white transition hover:text-gray-300"
          >
            <Search
              size={20}
              strokeWidth={1.8}
            />
          </button>

          {/* WISHLIST */}

          <button
            onClick={handleWishlist}
            className="relative text-white transition hover:text-gray-300"
            aria-label="Wishlist"
          >
            <Heart
              size={20}
              strokeWidth={1.8}
            />

            {isLoggedIn && wishlistCount > 0 && (
              <span
                className="absolute -right-2 -top-2 flex h-4 min-w-4
                items-center justify-center rounded-full
                bg-white px-1 text-[10px] font-semibold text-black"
              >
                {wishlistCount}
              </span>
            )}
          </button>

          {/* CART */}

          <Link
            href="/cart"
            className="text-white transition hover:text-gray-300"
          >
            <ShoppingBag
              size={20}
              strokeWidth={1.8}
            />
          </Link>

          {/* =========================
              LOGGED IN USER
          ========================= */}

          {isLoggedIn ? (
            <div className="relative">

              {/* PROFILE BUTTON */}

              <button
                onClick={() =>
                  setShowProfile((prev) => !prev)
                }
                className="flex items-center gap-2.5 text-white
                transition hover:text-gray-300"
              >
                <div
                  className="flex h-9 w-9 items-center
                  justify-center rounded-full border border-white/30
                  bg-white/10 backdrop-blur-sm"
                >
                  <User size={18} />
                </div>

                <span className="hidden text-sm font-medium sm:inline-block">
                  {userName}
                </span>

                <ChevronDown
                  size={16}
                  className={`transition-transform duration-300 ${
                    showProfile
                      ? "rotate-180"
                      : ""
                  }`}
                />
              </button>

              {/* PROFILE DROPDOWN */}

              {showProfile && (
                <div
                  className="absolute right-0 top-12 w-60
                  overflow-hidden rounded-xl border border-gray-200
                  bg-white shadow-2xl"
                >

                  {/* PROFILE */}

                  <button
                    onClick={() => {
                      router.push("/profile");
                      setShowProfile(false);
                    }}
                    className="flex w-full items-center gap-3
                    px-5 py-3 text-left text-sm text-gray-700
                    transition hover:bg-gray-100"
                  >
                    <User size={18} />
                    <span>My Profile</span>
                  </button>

                  {/* ORDERS */}

                  <button
                    onClick={() => {
                      router.push("/orders");
                      setShowProfile(false);
                    }}
                    className="flex w-full items-center gap-3
                    px-5 py-3 text-left text-sm text-gray-700
                    transition hover:bg-gray-100"
                  >
                    <Package size={18} />
                    <span>My Orders</span>
                  </button>

                  {/* WISHLIST */}

                  <button
                    onClick={() => {
                      router.push("/wishlist");
                      setShowProfile(false);
                    }}
                    className="flex w-full items-center justify-between
                    px-5 py-3 text-left text-sm text-gray-700
                    transition hover:bg-gray-100"
                  >
                    <div className="flex items-center gap-3">
                      <Heart size={18} />
                      <span>Wishlist</span>
                    </div>

                    {wishlistCount > 0 && (
                      <span
                        className="flex h-5 min-w-5 items-center
                        justify-center rounded-full bg-black
                        px-1.5 text-[10px] font-semibold text-white"
                      >
                        {wishlistCount}
                      </span>
                    )}
                  </button>

                  <div className="my-1 border-t border-gray-100" />

                  {/* SETTINGS */}

                  <button
                    onClick={() => {
                      router.push("/settings");
                      setShowProfile(false);
                    }}
                    className="flex w-full items-center gap-3
                    px-5 py-3 text-left text-sm text-gray-700
                    transition hover:bg-gray-100"
                  >
                    <Settings size={18} />
                    <span>Settings</span>
                  </button>

                  {/* REPORT */}

                  <button
                    onClick={() => {
                      router.push("/report");
                      setShowProfile(false);
                    }}
                    className="flex w-full items-center gap-3
                    px-5 py-3 text-left text-sm text-gray-700
                    transition hover:bg-gray-100"
                  >
                    <Flag size={18} />
                    <span>Report a Problem</span>
                  </button>

                  <div className="my-1 border-t border-gray-100" />

                  {/* LOGOUT */}

                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3
                    px-5 py-3 text-left text-sm text-red-600
                    transition hover:bg-red-50"
                  >
                    <LogOut size={18} />
                    <span>Logout</span>
                  </button>

                </div>
              )}

            </div>
          ) : (
            /* SIGN UP */

            <button
              onClick={handleSign}
              className="rounded-full border border-white/20
              bg-white/10 px-4 py-2.5 text-sm font-semibold
              text-white backdrop-blur-sm transition
              hover:bg-white hover:text-black"
            >
              Sign Up
            </button>
          )}

        </div>
      </div>
    </nav>
  );
}

