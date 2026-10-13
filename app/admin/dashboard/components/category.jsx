"use client";

import { useEffect, useState } from "react";
import axios from "axios";

import {
  Tags,
  Filter,
  Users,
  Store,
  Layers3,
  Package,
  AlertCircle,
} from "lucide-react";

export default function Categories() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);

  const [filterType, setFilterType] = useState("all");
  const [filterValue, setFilterValue] = useState("");

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // ==========================================
  // GET ALL PRODUCTS
  // ==========================================

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setMessage("");

      const response = await axios.get("/api/admin");

      const productData = response.data.products || [];

      setProducts(productData);
      setFilteredProducts(productData);
    } catch (error) {
      console.error("Get products error:", error);

      setMessage(
        error.response?.data?.message ||
          "Failed to load products"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // ==========================================
  // FILTER PRODUCTS
  // ==========================================

  const handleFilter = (type, value = "") => {
    setFilterType(type);
    setFilterValue(value);

    if (type === "all") {
      setFilteredProducts(products);
      return;
    }

    const filtered = products.filter((product) => {
      if (type === "gender") {
        return product.gender === value;
      }

      if (type === "brand") {
        return product.brand === value;
      }

      if (type === "category") {
        return product.category === value;
      }

      return true;
    });

    setFilteredProducts(filtered);
  };

  // ==========================================
  // UNIQUE BRANDS
  // ==========================================

  const brands = [
    ...new Set(
      products
        .map((product) => product.brand)
        .filter(Boolean)
    ),
  ];

  // ==========================================
  // UNIQUE CATEGORIES
  // ==========================================

  const categories = [
    ...new Set(
      products
        .map((product) => product.category)
        .filter(Boolean)
    ),
  ];

  // ==========================================
  // IMAGE
  // ==========================================

  const getImage = (product) => {
    // New product structure
    if (
      Array.isArray(product?.images) &&
      product.images.length > 0 &&
      product.images[0]
    ) {
      return product.images[0];
    }

    // Old product structure
    if (product?.image) {
      return product.image;
    }

    // No local fallback image
    return "";
  };

  // ==========================================
  // CATEGORY COLORS
  // ==========================================

  const getCategoryStyle = (category) => {
    if (category === "Luxury") {
      return "bg-purple-100 text-purple-700 border-purple-200";
    }

    if (category === "Classic") {
      return "bg-amber-100 text-amber-700 border-amber-200";
    }

    if (category === "Sport") {
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    }

    if (category === "Smart") {
      return "bg-blue-100 text-blue-700 border-blue-200";
    }

    return "bg-gray-100 text-gray-600 border-gray-200";
  };

  // ==========================================
  // GENDER COLORS
  // ==========================================

  const getGenderStyle = (gender) => {
    if (gender === "Men") {
      return "bg-blue-100 text-blue-700 border-blue-200";
    }

    if (gender === "Women") {
      return "bg-pink-100 text-pink-700 border-pink-200";
    }

    return "bg-gray-100 text-gray-600 border-gray-200";
  };

  return (
    <div className="w-full space-y-8 p-6">

      {/* ==========================================
          HEADER
      ========================================== */}

      <div className="mt-4">

        <div className="flex items-center gap-3">

          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
            <Tags
              size={22}
              strokeWidth={1.8}
            />
          </div>

          <div>

            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-500">
              Product Management
            </p>

            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-black">
              Categories
            </h1>

          </div>

        </div>

        <p className="mt-3 text-sm text-black/50">
          Browse and filter watches by gender, brand and category.
        </p>

      </div>

      {/* ==========================================
          SUMMARY CARD
      ========================================== */}

      <div className="rounded-2xl border border-violet-100 bg-gradient-to-r from-violet-50 via-indigo-50 to-blue-50 p-6 shadow-sm">

        <div className="flex items-center justify-between">

          <div className="flex items-center gap-4">

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-600 text-white shadow-sm">
              <Package
                size={21}
                strokeWidth={1.8}
              />
            </div>

            <div>

              <p className="text-xs font-semibold uppercase tracking-wider text-violet-500">
                Total Products
              </p>

              <p className="mt-1 text-3xl font-bold text-violet-950">
                {loading ? "..." : products.length}
              </p>

            </div>

          </div>

          <div className="hidden rounded-xl bg-white/70 px-4 py-3 sm:block">

            <p className="text-xs text-violet-500">
              Current View
            </p>

            <div className="mt-1 flex items-center gap-2">

              <span className="h-2.5 w-2.5 rounded-full bg-violet-500" />

              <span className="text-sm font-semibold capitalize text-violet-700">
                {filterType === "all"
                  ? "All Products"
                  : filterValue}
              </span>

            </div>

          </div>

        </div>

      </div>

      {/* ==========================================
          FILTER SECTION
      ========================================== */}

      <div className="overflow-hidden rounded-2xl border border-indigo-100 bg-white shadow-sm">

        <div className="border-b border-indigo-100 bg-gradient-to-r from-indigo-50 to-violet-50 px-6 py-4">

          <div className="flex items-center gap-3">

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
              <Filter size={17} />
            </div>

            <div>

              <h2 className="text-base font-semibold text-indigo-950">
                Filter Products
              </h2>

              <p className="mt-1 text-xs text-indigo-600/70">
                Choose a filter to view specific watches
              </p>

            </div>

          </div>

        </div>

        <div className="space-y-7 p-6">

          {/* ========================================
              GENDER
          ======================================== */}

          <div>

            <div className="mb-3 flex items-center gap-2">

              <Users
                size={16}
                className="text-blue-500"
              />

              <h2 className="text-sm font-semibold text-gray-800">
                Gender
              </h2>

            </div>

            <div className="flex flex-wrap gap-3">

              <button
                type="button"
                onClick={() => handleFilter("all")}
                className={`rounded-lg border px-5 py-2.5 text-sm font-medium transition-all ${
                  filterType === "all"
                    ? "border-violet-600 bg-violet-600 text-white shadow-sm"
                    : "border-gray-200 bg-white text-gray-600 hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700"
                }`}
              >
                All
              </button>

              <button
                type="button"
                onClick={() =>
                  handleFilter("gender", "Men")
                }
                className={`rounded-lg border px-5 py-2.5 text-sm font-medium transition-all ${
                  filterType === "gender" &&
                  filterValue === "Men"
                    ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                    : "border-gray-200 bg-white text-gray-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                }`}
              >
                Men
              </button>

              <button
                type="button"
                onClick={() =>
                  handleFilter("gender", "Women")
                }
                className={`rounded-lg border px-5 py-2.5 text-sm font-medium transition-all ${
                  filterType === "gender" &&
                  filterValue === "Women"
                    ? "border-pink-600 bg-pink-600 text-white shadow-sm"
                    : "border-gray-200 bg-white text-gray-600 hover:border-pink-300 hover:bg-pink-50 hover:text-pink-700"
                }`}
              >
                Women
              </button>

            </div>

          </div>

          {/* ========================================
              BRAND
          ======================================== */}

          <div>

            <div className="mb-3 flex items-center gap-2">

              <Store
                size={16}
                className="text-purple-500"
              />

              <h2 className="text-sm font-semibold text-gray-800">
                Brand
              </h2>

            </div>

            <div className="flex flex-wrap gap-3">

              {brands.length === 0 ? (

                <p className="rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-400">
                  No brands available
                </p>

              ) : (

                brands.map((brand) => (

                  <button
                    type="button"
                    key={brand}
                    onClick={() =>
                      handleFilter("brand", brand)
                    }
                    className={`rounded-lg border px-5 py-2.5 text-sm font-medium transition-all ${
                      filterType === "brand" &&
                      filterValue === brand
                        ? "border-purple-600 bg-purple-600 text-white shadow-sm"
                        : "border-gray-200 bg-white text-gray-600 hover:border-purple-300 hover:bg-purple-50 hover:text-purple-700"
                    }`}
                  >
                    {brand}
                  </button>

                ))

              )}

            </div>

          </div>

          {/* ========================================
              CATEGORY
          ======================================== */}

          <div>

            <div className="mb-3 flex items-center gap-2">

              <Layers3
                size={16}
                className="text-emerald-500"
              />

              <h2 className="text-sm font-semibold text-gray-800">
                Category
              </h2>

            </div>

            <div className="flex flex-wrap gap-3">

              {categories.length === 0 ? (

                <p className="rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-400">
                  No categories available
                </p>

              ) : (

                categories.map((category) => (

                  <button
                    type="button"
                    key={category}
                    onClick={() =>
                      handleFilter(
                        "category",
                        category
                      )
                    }
                    className={`rounded-lg border px-5 py-2.5 text-sm font-medium transition-all ${
                      filterType === "category" &&
                      filterValue === category
                        ? "border-emerald-600 bg-emerald-600 text-white shadow-sm"
                        : "border-gray-200 bg-white text-gray-600 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                    }`}
                  >
                    {category}
                  </button>

                ))

              )}

            </div>

          </div>

        </div>

      </div>

      {/* ==========================================
          ERROR MESSAGE
      ========================================== */}

      {message && (

        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">

          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 text-red-600">

            <AlertCircle size={16} />

          </div>

          <span>{message}</span>

        </div>

      )}

      {/* ==========================================
          LOADING
      ========================================== */}

      {loading ? (

        <div className="flex flex-col items-center justify-center rounded-2xl border border-indigo-100 bg-white py-20 shadow-sm">

          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-500">

            <Package
              size={22}
              className="animate-pulse"
            />

          </div>

          <p className="mt-4 text-sm font-medium text-indigo-700">
            Loading products...
          </p>

          <p className="mt-1 text-xs text-gray-400">
            Please wait
          </p>

        </div>

      ) : (

        <>

          {/* ========================================
              PRODUCT HEADER
          ======================================== */}

          <div className="flex items-center justify-between">

            <div>

              <div className="flex items-center gap-2">

                <Package
                  size={19}
                  className="text-violet-600"
                />

                <h2 className="text-lg font-semibold text-black">
                  Products
                </h2>

              </div>

              <p className="mt-1 text-xs text-gray-400">
                Showing products based on your selected filter
              </p>

            </div>

            <div className="rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700">
              {filteredProducts.length} Products
            </div>

          </div>

          {/* ==========================================
              NO PRODUCTS
          ========================================== */}

          {filteredProducts.length === 0 ? (

            <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400">

                <Package
                  size={26}
                  strokeWidth={1.5}
                />

              </div>

              <p className="mt-4 text-sm font-semibold text-gray-600">
                No products found
              </p>

              <p className="mt-1 text-xs text-gray-400">
                No products match the selected filter.
              </p>

            </div>

          ) : (

            /* ==========================================
               PRODUCT GRID
            ========================================== */

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

              {filteredProducts.map((product) => {
                const image = getImage(product);

                return (
                  <div
                    key={product._id}
                    className="group overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-violet-200 hover:shadow-lg"
                  >

                    {/* ==================================
                        IMAGE
                    ================================== */}

                    <div className="relative h-60 w-full overflow-hidden bg-gradient-to-br from-gray-50 to-indigo-50">

                      {image ? (
                        <img
                          src={image}
                          alt={product.name || "Watch"}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm">
                            <Package
                              size={26}
                              strokeWidth={1.5}
                              className="text-gray-300"
                            />
                          </div>
                        </div>
                      )}

                      {/* Category */}

                      {product.category && (

                        <div className="absolute right-3 top-3">

                          <span
                            className={`rounded-full border px-3 py-1.5 text-xs font-semibold shadow-sm ${getCategoryStyle(
                              product.category
                            )}`}
                          >
                            {product.category}
                          </span>

                        </div>

                      )}

                    </div>

                    {/* ==================================
                        DETAILS
                    ================================== */}

                    <div className="p-5">

                      <div className="flex items-start justify-between gap-3">

                        <div className="min-w-0">

                          <h3 className="truncate text-base font-bold text-gray-900">
                            {product.name}
                          </h3>

                          <p className="mt-1 truncate text-sm font-medium text-violet-600">
                            {product.brand}
                          </p>

                        </div>

                      </div>

                      {/* Price */}

                      <div className="mt-4 rounded-xl bg-gradient-to-r from-emerald-50 to-green-50 p-3">

                        <p className="text-xs font-medium text-emerald-600">
                          Offer Price
                        </p>

                        <div className="mt-1 flex items-center gap-2">

                          <p className="text-lg font-bold text-emerald-700">
                            ₹{product.offerPrice}
                          </p>

                          {product.price && (
                            <p className="text-xs text-gray-400 line-through">
                              ₹{product.price}
                            </p>
                          )}

                        </div>

                      </div>

                      {/* Gender */}

                      {product.gender && (

                        <div className="mt-4 flex items-center justify-between">

                          <span className="text-xs font-medium text-gray-400">
                            Gender
                          </span>

                          <span
                            className={`rounded-full border px-3 py-1 text-xs font-semibold ${getGenderStyle(
                              product.gender
                            )}`}
                          >
                            {product.gender}
                          </span>

                        </div>

                      )}

                    </div>

                  </div>
                );
              })}

            </div>

          )}

        </>

      )}

    </div>
  );
}