"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export default function ProductList({ refreshKey, onEdit }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [activeImage, setActiveImage] = useState({});

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setMessage("");

      const response = await axios.get("/api/admin");

      setProducts(
        Array.isArray(response.data.products)
          ? response.data.products
          : []
      );
    } catch (error) {
      console.error("Fetch products error:", error);

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
  }, [refreshKey]);

  // =========================
  // NEXT IMAGE
  // =========================
  const nextImage = (productId, imageCount) => {
    setActiveImage((prev) => ({
      ...prev,
      [productId]:
        ((prev[productId] || 0) + 1) % imageCount,
    }));
  };

  // =========================
  // PREVIOUS IMAGE
  // =========================
  const previousImage = (productId, imageCount) => {
    setActiveImage((prev) => ({
      ...prev,
      [productId]:
        ((prev[productId] || 0) - 1 + imageCount) %
        imageCount,
    }));
  };

  // =========================
  // DELETE PRODUCT
  // =========================
  const handleDelete = async (productId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      setMessage("");

      const response = await axios.delete("/api/admin", {
        data: {
          id: productId,
        },
      });

      setMessage(
        response.data.message ||
          "Product deleted successfully"
      );

      // Remove deleted product immediately from UI
      setProducts((prev) =>
        prev.filter((product) => product._id !== productId)
      );
    } catch (error) {
      console.error("Delete product error:", error);

      setMessage(
        error.response?.data?.message ||
          "Failed to delete product"
      );
    }
  };

  // =========================
  // LOADING
  // =========================
  if (loading) {
    return (
      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 text-center">
        <p className="text-sm text-gray-500">
          Loading products...
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6">

      {/* HEADER */}
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-black">
          Watch Products
        </h2>

        <p className="text-sm text-gray-500">
          {products.length} Products
        </p>
      </div>

      {/* MESSAGE */}
      {message && (
        <div className="mb-4 rounded-lg bg-gray-100 px-4 py-3 text-sm text-gray-700">
          {message}
        </div>
      )}

      {/* NO PRODUCTS */}
      {products.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center">
          <p className="text-sm text-gray-500">
            No products found
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">

          {products.map((product) => {

            const images = Array.isArray(product.images)
              ? product.images.filter(Boolean)
              : product.image
              ? [product.image]
              : [];

            const currentIndex =
              activeImage[product._id] || 0;

            const currentImage =
              images[currentIndex];

            // =========================
            // OFFER
            // =========================
            const hasOffer =
              product.price > product.offerPrice;

            const offerPercentage = hasOffer
              ? Math.round(
                  ((product.price -
                    product.offerPrice) /
                    product.price) *
                    100
                )
              : 0;

            return (
              <div
                key={product._id}
                className="group relative flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
              >

                {/* =========================
                    IMAGE
                ========================= */}
                <div className="relative h-48 w-full overflow-hidden bg-gray-100">

                  {/* OFFER */}
                  {hasOffer && (
                    <div className="absolute left-0 top-0 z-10 rounded-br-lg bg-red-600 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow">
                      {offerPercentage}% OFF
                    </div>
                  )}

                  {/* MAIN IMAGE */}
                  {currentImage ? (
                    <img
                      src={currentImage}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-gray-400">
                      No Image
                    </div>
                  )}

                  {/* IMAGE SLIDER */}
                  {images.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          previousImage(
                            product._id,
                            images.length
                          )
                        }
                        className="absolute left-1.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-xs font-bold shadow transition hover:bg-white"
                      >
                        ←
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          nextImage(
                            product._id,
                            images.length
                          )
                        }
                        className="absolute right-1.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-xs font-bold shadow transition hover:bg-white"
                      >
                        →
                      </button>

                      <div className="absolute bottom-2 right-2 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
                        {currentIndex + 1}/{images.length}
                      </div>
                    </>
                  )}
                </div>

                {/* =========================
                    DETAILS
                ========================= */}
                <div className="flex flex-1 flex-col p-3">

                  {/* BRAND */}
                  <p className="text-[11px] font-extrabold uppercase tracking-wide text-[#D4AF37]">
                    {product.brand || "BRAND"}
                  </p>

                  {/* NAME */}
                  <h3 className="mt-0.5 truncate text-sm font-medium text-gray-900">
                    {product.name}
                  </h3>

                  {/* CATEGORY */}
                  <p className="mt-0.5 text-[11px] text-gray-500">
                    {product.category} • {product.gender}
                  </p>

                  {/* PRICE */}
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-base font-bold text-black">
                      ₹{product.offerPrice}
                    </span>

                    {hasOffer && (
                      <span className="text-xs text-gray-400 line-through">
                        ₹{product.price}
                      </span>
                    )}
                  </div>

                  {/* SIZE */}
                  <div className="mt-2 text-xs text-gray-600">
                    <span className="font-semibold text-gray-700">
                      Size:
                    </span>{" "}
                    {Array.isArray(product.size) &&
                    product.size.length > 0
                      ? product.size.join(", ")
                      : "Free Size"}
                  </div>

                  {/* COLOR */}
                  <div className="mt-1 text-xs text-gray-600">
                    <span className="font-semibold text-gray-700">
                      Color:
                    </span>{" "}
                    {Array.isArray(product.colors) &&
                    product.colors.length > 0
                      ? product.colors.join(", ")
                      : "-"}
                  </div>

                  {/* STOCK */}
                  <div className="mt-2 text-xs text-gray-600">
                    <span className="font-semibold text-gray-700">
                      Stock:
                    </span>{" "}
                    {product.stock}
                  </div>

                  {/* =========================
                      EDIT + DELETE
                  ========================= */}
                  <div className="mt-3 flex gap-2 border-t border-gray-100 pt-3">

                    <button
                      type="button"
                      onClick={() => onEdit(product)}
                      className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-800 transition hover:bg-gray-100"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(product._id)
                      }
                      className="flex-1 rounded-lg bg-black px-3 py-2 text-xs font-semibold text-white transition hover:bg-gray-800"
                    >
                      Delete
                    </button>

                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}