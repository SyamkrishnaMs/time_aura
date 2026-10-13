"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import {
  User,
  Mail,
  Phone,
  ShoppingBag,
  Heart,
  Settings,
  LogOut,
  ArrowLeft,
  Edit,
} from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // =====================================================
  // GET LOGGED-IN USER
  // =====================================================

  useEffect(() => {
    const getUser = async () => {
      try {
        setLoading(true);

        const response = await axios.get("/api/auth/me", {
          withCredentials: true,
        });

        if (response.data?.success) {
          setUser(response.data.user);
        } else {
          router.push("/auth");
        }
      } catch (error) {
        console.error("PROFILE FETCH ERROR:", error);

        if (error.response?.status === 401) {
          router.push("/auth");
        } else {
          setError("Unable to load profile");
        }
      } finally {
        setLoading(false);
      }
    };

    getUser();
  }, [router]);

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = async () => {
    try {
      setMessage("");

      await axios.post(
        "/api/auth/logout",
        {},
        {
          withCredentials: true,
        }
      );

      router.push("/auth");
      router.refresh();
    } catch (error) {
      console.error("LOGOUT ERROR:", error);
      setError("Logout failed");
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f8f8f1] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>

          <p className="text-sm text-gray-600">
            Loading profile...
          </p>
        </div>
      </main>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error && !user) {
    return (
      <main className="min-h-screen bg-[#f8f8f1] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>

          <button
            onClick={() => window.location.reload()}
            className="bg-black text-white px-5 py-2 rounded-md"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  // =====================================================
  // PROFILE PAGE
  // =====================================================

  return (
    <main className="min-h-screen bg-[#f8f8f1]">

      {/* ================= HEADER ================= */}

      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">

          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-gray-700 hover:text-black"
          >
            <ArrowLeft size={18} />
            Back to Shop
          </Link>

          <h1 className="text-xl font-semibold tracking-wide">
            TIME AURA
          </h1>

          <div className="w-24"></div>

        </div>
      </header>


      {/* ================= CONTENT ================= */}

      <section className="max-w-6xl mx-auto px-6 py-10">

        {/* PAGE TITLE */}

        <div className="mb-8">
          <p className="text-xs tracking-[0.3em] text-gray-500 uppercase">
            Account
          </p>

          <h2 className="text-3xl font-semibold mt-2">
            My Profile
          </h2>

          <p className="text-gray-500 mt-2">
            Manage your account and view your personal information.
          </p>
        </div>


        {/* ================= PROFILE GRID ================= */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ================= LEFT PROFILE CARD ================= */}

          <div className="bg-white border border-gray-200 rounded-xl p-6">

            <div className="flex flex-col items-center text-center">

              {/* PROFILE ICON */}

              <div className="w-24 h-24 rounded-full bg-black text-white flex items-center justify-center mb-5">
                <User size={42} strokeWidth={1.5} />
              </div>


              {/* NAME */}

              <h3 className="text-xl font-semibold">
                {user?.name || "User"}
              </h3>


              {/* EMAIL */}

              <p className="text-sm text-gray-500 mt-1 break-all">
                {user?.email || "No email"}
              </p>


              {/* EDIT BUTTON */}

              <button
                onClick={() => router.push("/profile/edit")}
                className="mt-6 w-full border border-black rounded-lg py-3 flex items-center justify-center gap-2 text-sm font-medium hover:bg-black hover:text-white transition"
              >
                <Edit size={17} />
                Edit Profile
              </button>

            </div>

          </div>


          {/* ================= RIGHT DETAILS ================= */}

          <div className="lg:col-span-2 space-y-6">

            {/* PERSONAL INFORMATION */}

            <div className="bg-white border border-gray-200 rounded-xl p-6">

              <div className="flex items-center justify-between mb-6">

                <div>
                  <h3 className="text-lg font-semibold">
                    Personal Information
                  </h3>

                  <p className="text-sm text-gray-500 mt-1">
                    Your account details
                  </p>
                </div>

                <User size={22} className="text-gray-500" />

              </div>


              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                {/* NAME */}

                <div className="border border-gray-200 rounded-lg p-4">

                  <div className="flex items-center gap-3 mb-2">
                    <User size={18} className="text-gray-500" />

                    <span className="text-xs text-gray-500 uppercase tracking-wide">
                      Name
                    </span>
                  </div>

                  <p className="font-medium">
                    {user?.name || "Not added"}
                  </p>

                </div>


                {/* EMAIL */}

                <div className="border border-gray-200 rounded-lg p-4">

                  <div className="flex items-center gap-3 mb-2">
                    <Mail size={18} className="text-gray-500" />

                    <span className="text-xs text-gray-500 uppercase tracking-wide">
                      Email
                    </span>
                  </div>

                  <p className="font-medium break-all">
                    {user?.email || "Not added"}
                  </p>

                </div>


                {/* PHONE */}

                <div className="border border-gray-200 rounded-lg p-4">

                  <div className="flex items-center gap-3 mb-2">
                    <Phone size={18} className="text-gray-500" />

                    <span className="text-xs text-gray-500 uppercase tracking-wide">
                      Phone
                    </span>
                  </div>

                  <p className="font-medium">
                    {user?.phone || "Not added"}
                  </p>

                </div>


                {/* ROLE */}

                <div className="border border-gray-200 rounded-lg p-4">

                  <div className="flex items-center gap-3 mb-2">
                    <Settings size={18} className="text-gray-500" />

                    <span className="text-xs text-gray-500 uppercase tracking-wide">
                      Account Type
                    </span>
                  </div>

                  <p className="font-medium capitalize">
                    {user?.role || "customer"}
                  </p>

                </div>

              </div>

            </div>


            {/* ================= QUICK ACTIONS ================= */}

            <div className="bg-white border border-gray-200 rounded-xl p-6">

              <h3 className="text-lg font-semibold">
                Quick Actions
              </h3>

              <p className="text-sm text-gray-500 mt-1 mb-5">
                Manage your Time Aura account
              </p>


              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {/* ORDERS */}

                <Link
                  href="/my_order"
                  className="border border-gray-200 rounded-lg p-5 hover:border-black transition"
                >
                  <div className="flex items-center gap-3">

                    <div className="w-10 h-10 rounded-lg bg-black text-white flex items-center justify-center">
                      <ShoppingBag size={20} />
                    </div>

                    <div>
                      <h4 className="font-medium">
                        My Orders
                      </h4>

                      <p className="text-xs text-gray-500 mt-1">
                        View your orders
                      </p>
                    </div>

                  </div>
                </Link>


                {/* WISHLIST */}

                <Link
                  href="/wishlist"
                  className="border border-gray-200 rounded-lg p-5 hover:border-black transition"
                >
                  <div className="flex items-center gap-3">

                    <div className="w-10 h-10 rounded-lg bg-black text-white flex items-center justify-center">
                      <Heart size={20} />
                    </div>

                    <div>
                      <h4 className="font-medium">
                        Wishlist
                      </h4>

                      <p className="text-xs text-gray-500 mt-1">
                        View saved watches
                      </p>
                    </div>

                  </div>
                </Link>

              </div>

            </div>


            {/* ================= LOGOUT ================= */}

            <div className="bg-white border border-gray-200 rounded-xl p-6">

              <div className="flex items-center justify-between gap-4">

                <div>
                  <h3 className="font-semibold">
                    Logout
                  </h3>

                  <p className="text-sm text-gray-500 mt-1">
                    Sign out from your Time Aura account.
                  </p>
                </div>

                <button
                  onClick={handleLogout}
                  className="shrink-0 bg-black text-white px-5 py-3 rounded-lg flex items-center gap-2 text-sm hover:bg-gray-800 transition"
                >
                  <LogOut size={17} />
                  Logout
                </button>

              </div>

            </div>


            {/* MESSAGE */}

            {message && (
              <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm">
                {message}
              </div>
            )}

          </div>

        </div>

      </section>

    </main>
  );
}