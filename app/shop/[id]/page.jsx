
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import {
  ArrowLeft,
  ShoppingBag,
  Plus,
  Minus,
} from "lucide-react";

export default function SingleProductPage() {
  const params = useParams();
  const router = useRouter();

  const productId = params.id;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);

  // =====================================================
  // FETCH PRODUCT
  // =====================================================

  useEffect(() => {
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setMessage("");

      const response = await axios.get("/api/admin");

      const products =
        response.data.products || response.data || [];

      const foundProduct = products.find(
        (item) => item._id === productId
      );

      if (!foundProduct) {
        setMessage("Product not found.");
        return;
      }

      setProduct(foundProduct);

      // Default size
      if (foundProduct.size?.length > 0) {
        setSelectedSize(foundProduct.size[0]);
      }

      // Default color
      if (foundProduct.colors?.length > 0) {
        setSelectedColor(foundProduct.colors[0]);
      }
    } catch (error) {
      console.error("FETCH SINGLE PRODUCT ERROR:", error);

      setMessage(
        error.response?.data?.message ||
          "Unable to load product."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // QUANTITY
  // =====================================================

  const increaseQuantity = () => {
    if (!product) return;

    if (quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  // =====================================================
  // ADD TO CART
  // =====================================================

  const handleAddToCart = async () => {
    try {
      if (!product) return;

      setMessage("");

      // Stock validation
      if (product.stock <= 0) {
        setMessage("Product is out of stock.");
        return;
      }

      // Size validation
      if (
        product.size?.length > 0 &&
        !selectedSize
      ) {
        setMessage("Please select a size.");
        return;
      }

      // Color validation
      if (
        product.colors?.length > 0 &&
        !selectedColor
      ) {
        setMessage("Please select a color.");
        return;
      }

      // Add product to cart
      await axios.post(
        "/api/cart",
        {
          productId: product._id,
          quantity,
          size: selectedSize,
          color: selectedColor,
        },
        {
          withCredentials: true,
        }
      );

      // Go to cart
      router.push("/cart");
    } catch (error) {
      console.error("ADD TO CART ERROR:", error);

      // User not logged in
      if (error.response?.status === 401) {
        router.push("/auth");
        return;
      }

      setMessage(
        error.response?.data?.message ||
          "Unable to add product to cart."
      );
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f8f1] flex items-center justify-center">
        <p className="text-xs text-gray-500">
          Loading product...
        </p>
      </div>
    );
  }

  // =====================================================
  // PRODUCT NOT FOUND
  // =====================================================

  if (!product) {
    return (
      <div className="min-h-screen bg-[#f8f8f1] flex flex-col items-center justify-center px-5 text-center">
        <h1 className="text-xl font-semibold">
          Product Not Found
        </h1>

        <p className="text-xs text-gray-500 mt-2">
          {message || "This product does not exist."}
        </p>

        <Link
          href="/shop"
          className="mt-5 bg-black text-white px-5 py-2 text-xs"
        >
          Back to Shop
        </Link>
      </div>
    );
  }

  // =====================================================
  // PRODUCT DATA
  // =====================================================

  const images =
    product.images?.length > 0
      ? product.images
      : product.image
      ? [product.image]
      : ["/hero_img/hero-watch.jpg"];

  const offerPrice =
    product.offerPrice || product.price;

  const hasOffer =
    product.offerPrice &&
    Number(product.offerPrice) <
      Number(product.price);

  const discountPercentage = hasOffer
    ? Math.round(
        ((Number(product.price) -
          Number(product.offerPrice)) /
          Number(product.price)) *
          100
      )
    : 0;

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="min-h-screen bg-[#f8f8f1]">

      {/* =================================================
          NAVBAR
      ================================================= */}

      <nav className="bg-black text-white px-4 md:px-6 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">

          <Link
            href="/"
            className="text-sm tracking-[0.25em]"
          >
            TIME AURA
          </Link>

          <div className="flex items-center gap-4">

            <Link
              href="/shop"
              className="text-[11px] hover:text-gray-300"
            >
              Shop
            </Link>

            <Link
              href="/cart"
              className="hover:text-gray-300"
            >
              <ShoppingBag size={16} />
            </Link>

          </div>
        </div>
      </nav>

      {/* =================================================
          BACK TO SHOP
      ================================================= */}

      <div className="max-w-5xl mx-auto px-4 md:px-6 pt-4">

        <Link
          href="/shop"
          className="inline-flex items-center gap-1 text-[10px] text-gray-500 hover:text-black"
        >
          <ArrowLeft size={12} />
          Back to Collection
        </Link>

      </div>

      {/* =================================================
          PRODUCT SECTION
      ================================================= */}

      <main className="max-w-5xl mx-auto px-4 md:px-6 py-5">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">

          {/* =================================================
              LEFT - IMAGES
          ================================================= */}

          <div className="max-w-[400px]">

            {/* Main Image */}

            <div className="relative bg-white aspect-square overflow-hidden">

              <img
                src={images[activeImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />

              {hasOffer && (
                <span className="absolute top-2 left-2 bg-black text-white text-[9px] px-2 py-1 tracking-wider">
                  {discountPercentage}% OFF
                </span>
              )}

            </div>

            {/* Thumbnail Images */}

            {images.length > 1 && (
              <div className="grid grid-cols-5 gap-1.5 mt-2">

                {images.map((image, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() =>
                      setActiveImage(index)
                    }
                    className={`aspect-square overflow-hidden bg-white border ${
                      activeImage === index
                        ? "border-black"
                        : "border-gray-200"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}

              </div>
            )}

          </div>

          {/* =================================================
              RIGHT - PRODUCT DETAILS
          ================================================= */}

          <div className="max-w-[420px]">

            {/* Brand */}

            <p className="text-[9px] tracking-[0.25em] uppercase text-gray-400">
              {product.brand}
            </p>

            {/* Product Name */}

            <h1 className="text-xl md:text-2xl font-semibold mt-1">
              {product.name}
            </h1>

            {/* Category + Gender */}

            <p className="text-[10px] text-gray-500 mt-1.5">
              {product.category} • {product.gender}
            </p>

            {/* Price */}

            <div className="flex items-center gap-2.5 mt-3">

              <span className="text-lg font-semibold">
                ₹
                {Number(
                  offerPrice
                ).toLocaleString("en-IN")}
              </span>

              {hasOffer && (
                <>
                  <span className="text-xs text-gray-400 line-through">
                    ₹
                    {Number(
                      product.price
                    ).toLocaleString("en-IN")}
                  </span>

                  <span className="text-[10px] font-medium">
                    {discountPercentage}% OFF
                  </span>
                </>
              )}

            </div>

            {/* =================================================
                DESCRIPTION
            ================================================= */}

            <div className="border-t border-gray-200 mt-4 pt-4">

              <h2 className="text-xs font-medium">
                Description
              </h2>

              <p className="text-[10px] text-gray-600 leading-5 mt-1.5">
                {product.description}
              </p>

            </div>

            {/* =================================================
                COLOR
            ================================================= */}

            {product.colors?.length > 0 && (
              <div className="mt-4">

                <div className="flex items-center gap-2 mb-1.5">

                  <h3 className="text-[10px] font-medium">
                    Color
                  </h3>

                  {selectedColor && (
                    <span className="text-[9px] text-gray-500">
                      {selectedColor}
                    </span>
                  )}

                </div>

                <div className="flex flex-wrap gap-1.5">

                  {product.colors.map(
                    (color, index) => (
                      <button
                        key={`${color}-${index}`}
                        type="button"
                        onClick={() =>
                          setSelectedColor(color)
                        }
                        className={`px-2.5 py-1 border text-[9px] transition ${
                          selectedColor === color
                            ? "bg-black text-white border-black"
                            : "bg-white text-black border-gray-300 hover:border-black"
                        }`}
                      >
                        {color}
                      </button>
                    )
                  )}

                </div>

              </div>
            )}

            {/* =================================================
                SIZE
            ================================================= */}

            {product.size?.length > 0 && (
              <div className="mt-4">

                <h3 className="text-[10px] font-medium mb-1.5">
                  Size
                </h3>

                <div className="flex flex-wrap gap-1.5">

                  {product.size.map(
                    (size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() =>
                          setSelectedSize(size)
                        }
                        className={`px-3 py-1 border text-[9px] transition ${
                          selectedSize === size
                            ? "bg-black text-white border-black"
                            : "bg-white text-black border-gray-300 hover:border-black"
                        }`}
                      >
                        {size}
                      </button>
                    )
                  )}

                </div>

              </div>
            )}

            {/* =================================================
                STOCK
            ================================================= */}

            <div className="mt-4">

              {product.stock > 0 ? (
                <p className="text-[10px] text-gray-600">

                  <span className="font-medium text-black">
                    In Stock
                  </span>

                  {" "}— {product.stock} available

                </p>
              ) : (
                <p className="text-[10px] text-red-600">
                  Out of stock
                </p>
              )}

            </div>

            {/* =================================================
                QUANTITY
            ================================================= */}

            {product.stock > 0 && (
              <div className="flex items-center gap-2.5 mt-4">

                <span className="text-[10px] font-medium">
                  Quantity
                </span>

                <div className="flex items-center border border-gray-300">

                  <button
                    type="button"
                    onClick={decreaseQuantity}
                    className="p-1.5 hover:bg-gray-100"
                  >
                    <Minus size={11} />
                  </button>

                  <span className="w-7 text-center text-[10px]">
                    {quantity}
                  </span>

                  <button
                    type="button"
                    onClick={increaseQuantity}
                    className="p-1.5 hover:bg-gray-100"
                  >
                    <Plus size={11} />
                  </button>

                </div>

              </div>
            )}

            {/* =================================================
                MESSAGE
            ================================================= */}

            {message && (
              <div className="mt-3 border border-red-200 bg-red-50 text-red-600 px-2.5 py-2 text-[10px]">
                {message}
              </div>
            )}

            {/* =================================================
                ADD TO CART
            ================================================= */}

            <button
              type="button"
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              className="w-full mt-4 bg-black text-white py-2.5 text-[10px] tracking-wider flex items-center justify-center gap-1.5 disabled:bg-gray-400"
            >

              <ShoppingBag size={14} />

              {product.stock > 0
                ? "ADD TO CART"
                : "OUT OF STOCK"}

            </button>

            {/* =================================================
                PRODUCT INFO
            ================================================= */}

            <div className="grid grid-cols-3 border-t border-gray-200 mt-5 pt-4 gap-2">

              <div>
                <p className="text-[9px] font-medium">
                  QUALITY
                </p>

                <p className="text-[9px] text-gray-500 mt-1">
                  Premium finish
                </p>
              </div>

              <div>
                <p className="text-[9px] font-medium">
                  DELIVERY
                </p>

                <p className="text-[9px] text-gray-500 mt-1">
                  Secure delivery
                </p>
              </div>

              <div>
                <p className="text-[9px] font-medium">
                  PAYMENT
                </p>

                <p className="text-[9px] text-gray-500 mt-1">
                  COD available
                </p>
              </div>

            </div>

          </div>

        </div>

        {/* =================================================
            TIME AURA PROMISE
        ================================================= */}

        <section className="border-t border-gray-200 mt-9 pt-6">

          <div className="text-center max-w-xl mx-auto">

            <p className="text-[9px] tracking-[0.3em] text-gray-400 uppercase">
              Time Aura
            </p>

            <h2 className="text-lg font-semibold mt-1.5">
              More Than Just Time
            </h2>

            <p className="text-[10px] text-gray-500 mt-1.5">
              Every Time Aura watch is designed to
              bring timeless character to your
              everyday style.
            </p>

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">

            <div className="text-center px-4">
              <p className="text-xs italic">
                “Crafted for timeless elegance.”
              </p>

              <p className="text-[9px] text-gray-400 mt-1.5">
                TIME AURA
              </p>
            </div>

            <div className="text-center px-4">
              <p className="text-xs italic">
                “Designed to complement every occasion.”
              </p>

              <p className="text-[9px] text-gray-400 mt-1.5">
                TIME AURA
              </p>
            </div>

            <div className="text-center px-4">
              <p className="text-xs italic">
                “Precision meets sophisticated style.”
              </p>

              <p className="text-[9px] text-gray-400 mt-1.5">
                TIME AURA
              </p>
            </div>

          </div>

        </section>

      </main>

      {/* =================================================
          FOOTER
      ================================================= */}

      <footer className="bg-black text-white py-6 px-4 mt-6">

        <div className="max-w-5xl mx-auto text-center">

          <h2 className="text-sm tracking-[0.25em]">
            TIME AURA
          </h2>

          <p className="text-gray-400 text-[9px] mt-1.5">
            MORE THAN JUST TIME
          </p>

          <p className="text-gray-600 text-[8px] mt-3">
            © {new Date().getFullYear()} Time Aura.
            All rights reserved.
          </p>

        </div>

      </footer>

    </div>
  );
}
