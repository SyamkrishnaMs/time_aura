
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function AdminLogin() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      const response = await axios.post(
        "/api/admin/login",
        {
          email,
          password,
        },
        {
          withCredentials: true,
        }
      );

      console.log("Admin login:", response.data);

      if (response.data.success) {
        router.push("/admin/dashboard");
      }
    } catch (error) {
      console.error("Admin login error:", error);

      setMessage(
        error.response?.data?.message ||
          "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f8f8f1] flex items-center justify-center px-4">

      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-serif tracking-[0.25em] text-black">
            TIME AURA
          </h1>

          <p className="text-xs tracking-[0.3em] text-gray-500 mt-2">
            ADMIN PANEL
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-black text-white rounded-2xl p-8 shadow-2xl">

          <h2 className="text-2xl font-serif mb-2">
            Admin Login
          </h2>

          <p className="text-gray-400 text-sm mb-8">
            Sign in to manage your Time Aura store.
          </p>

          <form
            onSubmit={handleLogin}
            className="space-y-5"
          >

            {/* Email */}
            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="admin@timeaura.com"
                required
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-white"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="Enter your password"
                required
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-white"
              />
            </div>

            {/* Error */}
            {message && (
              <p className="text-red-400 text-sm">
                {message}
              </p>
            )}

            {/* Login */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black py-3 rounded-lg font-medium hover:bg-gray-200 transition disabled:opacity-50"
            >
              {loading
                ? "Signing in..."
                : "Sign In"}
            </button>

          </form>
        </div>

        <p className="text-center text-xs text-gray-500 mt-6">
          Time Aura © 2026
        </p>

      </div>

    </main>
  );
}

