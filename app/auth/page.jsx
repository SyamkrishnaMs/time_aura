"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function AuthPage() {
const router = useRouter();

const [isLogin, setIsLogin] = useState(true);
const [showForgot, setShowForgot] = useState(false);

const [name, setName] = useState("");
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");

const [forgotEmail, setForgotEmail] = useState("");

const [message, setMessage] = useState("");
const [loading, setLoading] = useState(false);

const handleSubmit = async () => {
setMessage("");


if (!email || !password || (!isLogin && !name)) {
  setMessage("Please fill all fields");
  return;
}

try {
  setLoading(true);

  if (isLogin) {
    const response = await axios.post("/api/auth/login", {
      email,
      password,
    });

    const data = response.data;

    localStorage.setItem("token", data.token);

    localStorage.setItem(
      "user",
      JSON.stringify(data.user)
    );

    router.push("/shop");
  } else {
    const response = await axios.post(
      "/api/auth/register",
      {
        name,
        email,
        password,
      }
    );

    const data = response.data;

    setMessage(
      data.message || "Registration successful"
    );

    setName("");
    setEmail("");
    setPassword("");

    setIsLogin(true);
  }
} catch (error) {
  console.error(error);

  setMessage(
    error.response?.data?.message ||
      "Something went wrong"
  );
} finally {
  setLoading(false);
}


};

const handleForgotPassword = async () => {
setMessage("");


if (!forgotEmail) {
  setMessage("Please enter your email address");
  return;
}

try {
  setLoading(true);

  // Backend connect cheyyumbol ivide API call add cheyyam
  console.log("Reset password email:", forgotEmail);

  setMessage(
    "If this email is registered, a reset link will be sent."
  );
} catch (error) {
  console.error(error);

  setMessage("Something went wrong");
} finally {
  setLoading(false);
}


};

return ( <main className="relative min-h-screen overflow-hidden bg-black">

```
  {/* Background Watch */}
  <div
    className="absolute inset-0 bg-cover bg-center opacity-30"
    style={{
      backgroundImage:
        "url('/hero_img/hero-watch.jpg')",
    }}
  />

  {/* Dark Overlay */}
  <div className="absolute inset-0 bg-black/70" />

  {/* Logo */}
  <div className="absolute left-8 top-7 z-10">
    <h1 className="text-2xl font-light tracking-[0.3em] text-white">
      TIME AURA
    </h1>

    <p className="mt-1 text-[9px] tracking-[0.35em] text-gray-400">
      MORE THAN JUST TIME
    </p>
  </div>

  {/* Auth Card */}
  <div className="relative z-10 flex min-h-screen items-center justify-center px-4">

    <div className="w-full max-w-md rounded-2xl border border-white/20 bg-black/45 p-6 shadow-2xl backdrop-blur-md">

      {/* FORGOT PASSWORD */}
      {showForgot ? (
        <>
          {/* Heading */}
          <div className="text-center">

            <h2 className="font-serif text-3xl text-white">
              Forgot Password?
            </h2>

            <p className="mt-3 text-xs leading-5 text-gray-400">
              Enter your email address and we&apos;ll
              send you a link to reset your password.
            </p>

          </div>

          {/* Message */}
          {message && (
            <p className="mt-4 text-center text-xs text-gray-300">
              {message}
            </p>
          )}

          {/* Email */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleForgotPassword();
            }}
          >
            <input
              type="email"
              placeholder="Email Address"
              value={forgotEmail}
              onChange={(e) =>
                setForgotEmail(e.target.value)
              }
              className="mt-6 w-full rounded-lg border border-white/20 bg-transparent px-4 py-3 text-sm text-white outline-none placeholder:text-gray-500 focus:border-white/50"
            />

            {/* Reset Button */}
            <button
              type="submit"
              disabled={loading}
              className="mt-5 w-full rounded-lg bg-white py-3 text-sm font-semibold text-black transition hover:bg-gray-200 disabled:opacity-50"
            >
              {loading
                ? "Please wait..."
                : "Send Reset Link"}
            </button>
          </form>

          {/* Back to Login */}
          <div className="mt-5 text-center">
            <button
              type="button"
              onClick={() => {
                setShowForgot(false);
                setMessage("");
                setForgotEmail("");
              }}
              className="text-xs text-gray-400 transition hover:text-white"
            >
              ← Back to Login
            </button>
          </div>
        </>
      ) : (
        <>
          {/* Tabs */}
          <div className="flex justify-center gap-10 border-b border-white/10">

            <button
              type="button"
              onClick={() => {
                setIsLogin(true);
                setMessage("");
              }}
              className={`pb-3 text-sm transition ${
                isLogin
                  ? "border-b-2 border-white text-white"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              Login
            </button>

            <button
              type="button"
              onClick={() => {
                setIsLogin(false);
                setMessage("");
              }}
              className={`pb-3 text-sm transition ${
                !isLogin
                  ? "border-b-2 border-white text-white"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              Register
            </button>

          </div>

          {/* Heading */}
          <div className="mt-6 text-center">

            <h2 className="font-serif text-3xl text-white">
              {isLogin
                ? "Welcome Back"
                : "Create Account"}
            </h2>

            <p className="mt-2 text-xs text-gray-400">
              {isLogin
                ? "Login to your Time Aura account"
                : "Create your Time Aura account"}
            </p>

          </div>

          {/* Message */}
          {message && (
            <p className="mt-4 text-center text-xs text-gray-300">
              {message}
            </p>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >

            {/* Name */}
            {!isLogin && (
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                className="mt-5 w-full rounded-lg border border-white/20 bg-transparent px-4 py-3 text-sm text-white outline-none placeholder:text-gray-500 focus:border-white/50"
              />
            )}

            {/* Email */}
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              className="mt-4 w-full rounded-lg border border-white/20 bg-transparent px-4 py-3 text-sm text-white outline-none placeholder:text-gray-500 focus:border-white/50"
            />

            {/* Password */}
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              className="mt-4 w-full rounded-lg border border-white/20 bg-transparent px-4 py-3 text-sm text-white outline-none placeholder:text-gray-500 focus:border-white/50"
            />

            {/* Forgot Password */}
            {isLogin && (
              <div className="mt-2 text-right">
                <button
                  type="button"
                  onClick={() => {
                    setShowForgot(true);
                    setMessage("");
                  }}
                  className="text-[11px] text-gray-400 hover:text-white"
                >
                  Forgot Password?
                </button>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="mt-5 w-full rounded-lg bg-white py-3 text-sm font-semibold text-black transition hover:bg-gray-200 disabled:opacity-50"
            >
              {loading
                ? "Please wait..."
                : isLogin
                ? "Login"
                : "Create Account"}
            </button>

          </form>

          {/* OR */}
          <div className="my-5 flex items-center gap-3">

            <div className="h-px flex-1 bg-white/10" />

            <span className="text-[10px] text-gray-500">
              OR
            </span>

            <div className="h-px flex-1 bg-white/10" />

          </div>

          {/* Google */}
          <button
            type="button"
            className="w-full rounded-lg border border-white/20 py-3 text-xs text-white hover:bg-white/5"
          >
            Continue with Google
          </button>

          {/* Switch */}
          <p className="mt-5 text-center text-xs text-gray-400">

            {isLogin
              ? "Don't have an account?"
              : "Already have an account?"}

            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setMessage("");
              }}
              className="ml-2 text-white underline"
            >
              {isLogin ? "Register" : "Login"}
            </button>

          </p>
        </>
      )}

    </div>
  </div>
</main>


);
}
