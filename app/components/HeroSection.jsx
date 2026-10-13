
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

const HeroSection = () => {
  const router = useRouter();

  const [heroImage, setHeroImage] = useState("");
  const [loading, setLoading] = useState(true);

  // ==========================================
  // GET HERO IMAGE FROM MONGODB
  // ==========================================
  useEffect(() => {
    const fetchLandingPage = async () => {
      try {
        const response = await axios.get("/api/admin/landing", {
          withCredentials: true,
        });

        const image =
          response.data?.landingPage?.heroImage || "";

        setHeroImage(image);
      } catch (error) {
        console.error("FETCH LANDING PAGE ERROR:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLandingPage();
  }, []);

  // ==========================================
  // EXPLORE COLLECTION
  // ==========================================
  const handleExplore = async () => {
    try {
      // JWT is stored in httpOnly cookie,
      // so localStorage token should NOT be used.

      await axios.get("/api/auth/me", {
        withCredentials: true,
      });

      router.push("/shop");
    } catch (error) {
      router.push("/auth");
    }
  };

  return (
    <section className="relative min-h-screen overflow-hidden bg-black">

      {/* Background Image */}
      {!loading && heroImage && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url("${heroImage}")`,
          }}
        />
      )}

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/55" />

      {/* Content */}
      <div className="relative z-10 flex min-h-screen items-center">
        <div className="mx-auto w-full max-w-7xl px-8">

          <div className="max-w-xl">

            <p className="mb-4 text-xs tracking-[0.25em] text-gray-300 uppercase">
              Luxury Watch Brand
            </p>

            <h1 className="text-5xl font-light leading-tight text-white md:text-6xl">
              Timeless Elegance
              <br />

              <span className="font-normal">
                on Your Wrist
              </span>
            </h1>

            <p className="mt-6 max-w-md text-sm leading-6 text-gray-300">
              Discover watches crafted with precision, premium materials,
              and designs that last a lifetime.
            </p>

            <button
              onClick={handleExplore}
              className="mt-8 inline-flex rounded-full bg-white px-6 py-3 text-xs font-medium text-black transition hover:bg-gray-200"
            >
              Explore Collection
            </button>

          </div>
        </div>
      </div>

      {/* Bottom Info */}
      <div className="absolute bottom-8 left-0 z-10 w-full px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between">

          {/* Reviews */}
          <div className="flex items-center gap-3">

            <div className="flex -space-x-2">
              <div className="h-7 w-7 rounded-full border-2 border-black bg-gray-400" />
              <div className="h-7 w-7 rounded-full border-2 border-black bg-gray-500" />
              <div className="h-7 w-7 rounded-full border-2 border-black bg-gray-600" />
              <div className="h-7 w-7 rounded-full border-2 border-black bg-gray-300" />
            </div>

            <div>
              <div className="text-xs text-white">
                ★ 4.9/5
              </div>

              <div className="text-[10px] text-gray-400">
                1,234 Reviews
              </div>
            </div>

          </div>

          {/* Slider Dots */}
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
            <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
            <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
            <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
          </div>

        </div>
      </div>

    </section>
  );
};

export default HeroSection;
