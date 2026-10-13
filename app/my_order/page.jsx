"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import {
  ArrowLeft,
  Package,
  MapPin,
  CreditCard,
  Loader2,
} from "lucide-react";

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // ==========================================
  // FETCH ORDERS
  // ==========================================

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setMessage("");

      const response = await axios.get("/api/order", {
        withCredentials: true,
      });

      console.log("MY ORDERS RESPONSE:", response.data);

      if (response.data.success) {
        // IMPORTANT:
        // API returns "orders", not "order"
        setOrders(response.data.orders || []);
      }
    } catch (error) {
      console.error("FETCH ORDERS ERROR:", error);

      setMessage(
        error.response?.data?.message ||
          "Unable to load your orders"
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // LOAD ORDERS
  // ==========================================

  useEffect(() => {
    fetchOrders();
  }, []);

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F8F1] flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-700">
          <Loader2
            size={22}
            className="animate-spin"
          />

          <span>Loading your orders...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F8F1]">

      {/* ========================================
          HEADER
      ======================================== */}

      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-5">

          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-black transition"
          >
            <ArrowLeft size={17} />
            Back to Shop
          </Link>

        </div>
      </div>

      {/* ========================================
          MAIN
      ======================================== */}

      <main className="max-w-6xl mx-auto px-6 py-10">

        {/* TITLE */}

        <div className="mb-8">

          <p className="text-xs tracking-[0.25em] text-gray-500 uppercase mb-2">
            Time Aura
          </p>

          <h1 className="text-3xl md:text-4xl font-semibold text-black">
            My Orders
          </h1>

          <p className="text-gray-500 mt-2">
            View and track your watch orders
          </p>

        </div>

        {/* ======================================
            ERROR MESSAGE
        ====================================== */}

        {message && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-5 py-4 text-red-700">
            {message}
          </div>
        )}

        {/* ======================================
            NO ORDERS
        ====================================== */}

        {!message && orders.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">

            <Package
              size={48}
              className="mx-auto text-gray-400 mb-5"
            />

            <h2 className="text-xl font-semibold text-black">
              No orders yet
            </h2>

            <p className="text-gray-500 mt-2 mb-6">
              You haven't placed any orders yet.
            </p>

            <Link
              href="/shop"
              className="inline-flex items-center justify-center bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition"
            >
              Start Shopping
            </Link>

          </div>
        )}

        {/* ======================================
            ORDERS
        ====================================== */}

        <div className="space-y-6">

          {orders.map((order) => (

            <div
              key={order._id}
              className="bg-white border border-gray-200 rounded-2xl overflow-hidden"
            >

              {/* ==================================
                  ORDER HEADER
              ================================== */}

              <div className="px-6 py-5 border-b border-gray-200">

                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                  {/* ORDER ID */}

                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">
                      Order ID
                    </p>

                    <p className="text-sm font-medium text-black mt-1">
                      #{order._id}
                    </p>
                  </div>

                  {/* ORDER DATE */}

                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">
                      Ordered On
                    </p>

                    <p className="text-sm text-gray-700 mt-1">
                      {order.createdAt
                        ? new Date(
                            order.createdAt
                          ).toLocaleDateString(
                            "en-IN",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }
                          )
                        : "-"}
                    </p>
                  </div>

                  {/* ORDER STATUS */}

                  <div>
                    <span
                      className={`inline-flex px-3 py-1.5 rounded-full text-xs font-medium ${
                        order.orderStatus ===
                        "Delivered"
                          ? "bg-green-100 text-green-700"
                          : order.orderStatus ===
                            "Cancelled"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {order.orderStatus || "Placed"}
                    </span>
                  </div>

                </div>

              </div>

              {/* ==================================
                  ORDER ITEMS
              ================================== */}

              <div className="p-6 space-y-5">

                {order.items?.map(
                  (item, index) => {

                    const image =
                      item.image ||
                      item.product?.images?.[0] ||
                      item.product?.image ||
                      "";

                    return (
                      <div
                        key={`${order._id}-${index}`}
                        className="flex gap-4"
                      >

                        {/* IMAGE */}

                        <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden shrink-0">

                          {image ? (
                            <img
                              src={image}
                              alt={
                                item.name ||
                                item.product?.name ||
                                "Watch"
                              }
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <Package size={28} />
                            </div>
                          )}

                        </div>

                        {/* DETAILS */}

                        <div className="flex-1">

                          <h3 className="font-semibold text-black">
                            {item.name ||
                              item.product?.name ||
                              "Watch"}
                          </h3>

                          {item.brand && (
                            <p className="text-sm text-gray-500 mt-1">
                              {item.brand}
                            </p>
                          )}

                          {item.size && (
                            <p className="text-sm text-gray-500 mt-1">
                              Size: {item.size}
                            </p>
                          )}

                          <p className="text-sm text-gray-500 mt-1">
                            Quantity:{" "}
                            {item.quantity || 0}
                          </p>

                          <p className="font-medium text-black mt-2">
                            ₹
                            {Number(
                              item.price || 0
                            ).toLocaleString("en-IN")}
                          </p>

                        </div>

                        {/* ITEM TOTAL */}

                        <div className="text-right">

                          <p className="text-xs text-gray-500">
                            Total
                          </p>

                          <p className="font-semibold text-black mt-1">
                            ₹
                            {Number(
                              item.total || 0
                            ).toLocaleString("en-IN")}
                          </p>

                        </div>

                      </div>
                    );
                  }
                )}

              </div>

              {/* ==================================
                  ORDER DETAILS
              ================================== */}

              <div className="border-t border-gray-200 px-6 py-5">

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                  {/* PAYMENT */}

                  <div className="flex gap-3">

                    <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                      <CreditCard
                        size={18}
                        className="text-gray-700"
                      />
                    </div>

                    <div>

                      <p className="text-xs text-gray-500 uppercase tracking-wider">
                        Payment
                      </p>

                      <p className="text-sm font-medium text-black mt-1">
                        {order.paymentMethod || "-"}
                      </p>

                      <p className="text-xs text-gray-500 mt-1">
                        {order.paymentStatus || "-"}
                      </p>

                    </div>

                  </div>

                  {/* ADDRESS */}

                  <div className="flex gap-3">

                    <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                      <MapPin
                        size={18}
                        className="text-gray-700"
                      />
                    </div>

                    <div>

                      <p className="text-xs text-gray-500 uppercase tracking-wider">
                        Delivery
                      </p>

                      <p className="text-sm font-medium text-black mt-1">
                        {order.shippingAddress?.name ||
                          "-"}
                      </p>

                      <p className="text-xs text-gray-500 mt-1">
                        {order.shippingAddress?.city ||
                          "-"}
                        ,{" "}
                        {order.shippingAddress?.state ||
                          "-"}
                      </p>

                    </div>

                  </div>

                  {/* TOTAL */}

                  <div className="md:text-right">

                    <p className="text-xs text-gray-500 uppercase tracking-wider">
                      Order Total
                    </p>

                    <p className="text-2xl font-semibold text-black mt-1">
                      ₹
                      {Number(
                        order.totalAmount || 0
                      ).toLocaleString("en-IN")}
                    </p>

                  </div>

                </div>

              </div>

            </div>

          ))}

        </div>

      </main>

    </div>
  );
}