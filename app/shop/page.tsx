"use client";

import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

interface Product {
  _id: string;
  brand: string;
  name: string;
  description: string;
  price: string;
  category: string;
  image: string;
  stock: number;
}

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("All");

  // Fetch products from backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products");

        if (!res.ok) {
          throw new Error("Failed to fetch products");
        }

        const data = await res.json();

        setProducts(data.products || data);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter products by category
  const filteredProducts =
    category === "All"
      ? products
      : products.filter(
          (product) => product.category === category
        );

  return (
    <main className="min-h-screen bg-[#0c0c01] text-white">
      <Navbar />

      {/* SHOP HEADER */}
      <section className="px-6 pb-12 pt-20 md:px-12">
        <div className="mx-auto max-w-7xl text-center">
          {/* Small Brand Text */}
          <p className="mb-4 text-[10px] font-medium uppercase tracking-[0.5em] text-gray-400">
            Time Aura
          </p>

          {/* Main Heading */}
          <h1 className="font-serif text-5xl font-normal tracking-tight md:text-7xl text-[#f5f5f0]">
            Watch Collection
          </h1>

          {/* Description */}
          <p className="mx-auto mt-6 max-w-xl text-sm font-light leading-7 tracking-wide text-gray-400 md:text-base">
            Discover timeless watches crafted for those who
            appreciate elegance, precision and style.
          </p>
        </div>
      </section>

      {/* CATEGORY FILTER */}
      <section className="px-6 md:px-12">
        <div className="mx-auto flex max-w-7xl flex-wrap justify-center gap-3 border-b border-[#222215] pb-8">
          {[
            "All",
            "Luxury",
            "Classic",
            "Sport",
            "Smart",
          ].map((item) => (
            <button
              key={item}
              onClick={() => setCategory(item)}
              className={`rounded-full border px-6 py-2 text-[11px] uppercase tracking-[0.15em] transition-all duration-300 ${
                category === item
                  ? "border-[#f5f5f0] bg-[#f5f5f0] text-[#0c0c01]"
                  : "border-[#333322] bg-transparent text-gray-300 hover:border-[#f5f5f0] hover:text-white"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      {/* PRODUCTS SECTION */}
      <section className="px-6 py-14 md:px-12">
        <div className="mx-auto max-w-7xl">
          {/* LOADING */}
          {loading && (
            <div className="flex min-h-[300px] items-center justify-center">
              <p className="text-[11px] uppercase tracking-[0.25em] text-gray-400">
                Loading watches...
              </p>
            </div>
          )}

          {/* NO PRODUCTS */}
          {!loading && filteredProducts.length === 0 && (
            <div className="flex min-h-[300px] items-center justify-center">
              <div className="text-center">
                <h2 className="font-serif text-2xl font-normal text-[#f5f5f0]">
                  No watches found
                </h2>
                <p className="mt-3 text-sm font-light tracking-wide text-gray-400">
                  Check another category.
                </p>
              </div>
            </div>
          )}

          {/* PRODUCT GRID */}
          {!loading && filteredProducts.length > 0 && (
            <div className="grid grid-cols-1 gap-x-7 gap-y-14 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((product) => (
                <div key={product._id} className="group">
                  {/* PRODUCT IMAGE */}
                  <div className="relative aspect-square overflow-hidden bg-[#16160b]">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />

                    {/* SOLD OUT */}
                    {product.stock === 0 && (
                      <div className="absolute left-4 top-4 bg-[#0c0c01] px-3 py-1.5 text-[9px] uppercase tracking-[0.2em] text-white border border-[#333322]">
                        Sold Out
                      </div>
                    )}
                  </div>

                  {/* PRODUCT DETAILS */}
                  <div className="pt-5">
                    {/* BRAND */}
                    <p className="text-[9px] font-medium uppercase tracking-[0.35em] text-gray-400">
                      {product.brand}
                    </p>

                    {/* WATCH NAME */}
                    <h2 className="mt-2 font-serif text-2xl font-normal tracking-tight text-[#f5f5f0]">
                      {product.name}
                    </h2>

                    {/* CATEGORY */}
                    <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-gray-500">
                      {product.category}
                    </p>

                    {/* PRICE + VIEW */}
                    <div className="mt-5 flex items-center justify-between">
                      {/* PRICE */}
                      <p className="text-sm font-medium tracking-wide text-[#f5f5f0]">
                        ₹{product.price}
                      </p>

                      {/* VIEW BUTTON */}
                      <button
                        disabled={product.stock === 0}
                        className="border border-[#444433] px-5 py-2.5 text-[9px] uppercase tracking-[0.2em] text-gray-200 transition-all duration-300 hover:border-white hover:bg-white hover:text-[#0c0c01] disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        View
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}