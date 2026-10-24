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
  ShoppingBag,
} from "lucide-react";

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // FETCH ORDERS
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setMessage("");

      const response = await axios.get("/api/order", {
        withCredentials: true,
      });

      if (response.data.success) {
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

  useEffect(() => {
    fetchOrders();
  }, []);

  // LOADING STATE
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0e1015] flex items-center justify-center">
        <div className="flex items-center gap-3 text-amber-400">
          <Loader2 size={24} className="animate-spin" />
          <span className="text-sm font-bold uppercase tracking-wider">
            Loading your orders...
          </span>
        </div>
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        @keyframes borderBlink {
          0%, 100% {
            border-color: rgba(234, 179, 8, 0.7);
            box-shadow: 0 0 15px rgba(234, 179, 8, 0.25);
          }
          50% {
            border-color: rgba(234, 179, 8, 0.2);
            box-shadow: 0 0 5px rgba(234, 179, 8, 0.1);
          }
        }
        .gold-blink-box {
          animation: borderBlink 2.5s infinite ease-in-out;
        }
      `}</style>

      <div className="min-h-screen bg-[#0e1015] text-white">
        {/* HEADER */}
        <div className="border-b border-white/10 bg-[#12151c] sticky top-0 z-50 backdrop-blur-md">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 text-xs md:text-sm font-bold uppercase tracking-wider text-amber-400 hover:text-amber-300 transition"
            >
              <ArrowLeft size={18} />
              Back to Collection
            </Link>

            <h1 className="text-sm font-serif font-bold tracking-[0.25em] text-white hidden sm:block">
              TIME AURA
            </h1>
          </div>
        </div>

        {/* MAIN CONTAINER */}
        <main className="max-w-6xl mx-auto px-6 py-12">
          {/* TITLE SECTION */}
          <div className="mb-10">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-400 mb-2">
              Order History
            </p>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-white">
              My Orders
            </h1>
            <p className="text-gray-400 text-sm mt-2">
              View and track your luxury watch purchases.
            </p>
          </div>

          {/* ERROR MESSAGE */}
          {message && (
            <div className="mb-6 rounded-xl border border-red-500/40 bg-red-500/10 px-5 py-4 text-sm font-semibold text-red-300">
              {message}
            </div>
          )}

          {/* NO ORDERS */}
          {!message && orders.length === 0 && (
            <div className="bg-[#141720] border border-white/10 rounded-3xl p-12 text-center shadow-xl">
              <div className="w-16 h-16 bg-[#161a23] border border-amber-400/30 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-md">
                <Package size={32} className="text-amber-400" />
              </div>
              <h2 className="text-2xl font-serif font-bold text-white">
                No orders yet
              </h2>
              <p className="text-gray-400 text-sm mt-2 mb-8 max-w-sm mx-auto">
                You haven't placed any luxury watch orders yet.
              </p>
              <Link
                href="/shop"
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-black px-8 py-3.5 rounded-xl text-xs font-black uppercase tracking-[0.2em] shadow-lg shadow-amber-500/20 transition-all"
              >
                <ShoppingBag size={16} />
                Explore Collection
              </Link>
            </div>
          )}

          {/* ORDERS LIST */}
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order._id}
                className="gold-blink-box bg-[#141720] border-2 rounded-3xl overflow-hidden shadow-xl transition-all"
              >
                {/* ORDER HEADER */}
                <div className="px-6 py-5 border-b border-white/10 bg-[#161a23]">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        Order ID
                      </p>
                      <p className="text-xs font-mono font-bold text-amber-400 mt-0.5">
                        #{order._id}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        Ordered On
                      </p>
                      <p className="text-xs font-semibold text-gray-200 mt-0.5">
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleDateString(
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

                    <div>
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          order.orderStatus === "Delivered"
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                            : order.orderStatus === "Cancelled"
                            ? "bg-red-500/20 text-red-300 border border-red-500/40"
                            : "bg-amber-400/20 text-amber-300 border border-amber-400/40"
                        }`}
                      >
                        {order.orderStatus || "Placed"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ORDER ITEMS */}
                <div className="p-6 space-y-4">
                  {order.items?.map((item, index) => {
                    const image =
                      item.image ||
                      item.product?.images?.[0] ||
                      item.product?.image ||
                      "";

                    return (
                      <div
                        key={`${order._id}-${index}`}
                        className="flex gap-4 items-center border-b border-white/5 pb-4 last:border-0 last:pb-0"
                      >
                        <div className="w-20 h-20 bg-[#161a23] border border-white/10 rounded-xl overflow-hidden shrink-0 flex items-center justify-center p-1">
                          {image ? (
                            <img
                              src={image}
                              alt={
                                item.name ||
                                item.product?.name ||
                                "Watch"
                              }
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <Package size={24} className="text-gray-500" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-serif font-bold text-white text-sm sm:text-base truncate">
                            {item.name || item.product?.name || "Watch"}
                          </h3>

                          {item.brand && (
                            <p className="text-[11px] font-bold uppercase tracking-wider text-amber-400 mt-0.5">
                              {item.brand}
                            </p>
                          )}

                          <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-gray-400">
                            {item.size && <span>Size: {item.size}</span>}
                            <span>Qty: {item.quantity || 0}</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-[10px] text-gray-400 uppercase">Total</p>
                          <p className="text-sm sm:text-base font-black text-amber-400 mt-0.5">
                            ₹
                            {Number(
                              item.total || item.price * item.quantity || 0
                            ).toLocaleString("en-IN")}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* ORDER FOOTER DETAILS */}
                <div className="border-t border-white/10 bg-[#161a23]/60 px-6 py-5">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                    {/* PAYMENT INFO */}
                    <div className="flex gap-3 items-center">
                      <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                        <CreditCard size={18} className="text-amber-400" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                          Payment Mode
                        </p>
                        <p className="text-xs font-bold text-white mt-0.5">
                          {order.paymentMethod || "-"} ({order.paymentStatus || "Paid"})
                        </p>
                      </div>
                    </div>

                    {/* ADDRESS INFO */}
                    <div className="flex gap-3 items-center">
                      <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                        <MapPin size={18} className="text-amber-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                          Delivery To
                        </p>
                        <p className="text-xs font-bold text-white mt-0.5 truncate">
                          {order.shippingAddress?.name || "-"},{" "}
                          {order.shippingAddress?.city || "-"}
                        </p>
                      </div>
                    </div>

                    {/* TOTAL AMOUNT */}
                    <div className="md:text-right">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        Grand Total
                      </p>
                      <p className="text-xl font-black text-amber-400 mt-0.5">
                        ₹
                        {Number(order.totalAmount || 0).toLocaleString(
                          "en-IN"
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </>
  );
}