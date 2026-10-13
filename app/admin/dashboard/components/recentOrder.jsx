"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  ShoppingBag,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";

export default function RecentOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // ==========================================
  // FETCH RECENT ORDERS
  // ==========================================

  useEffect(() => {
    const fetchRecentOrders = async () => {
      try {
        const response = await axios.get("/api/admin/order");

        console.log("RECENT ORDERS RESPONSE:", response.data);

        if (response.data.success) {
          setOrders(response.data.orders || []);
        } else {
          setOrders([]);
        }
      } catch (error) {
        console.error(
          "Failed to fetch recent orders:",
          error
        );

        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentOrders();
  }, []);

  // ==========================================
  // ORDER STATUS ICON
  // ==========================================

  const getStatusIcon = (status) => {
    if (status === "Completed") {
      return <CheckCircle size={14} />;
    }

    if (
      status === "Cancelled" ||
      status === "Rejected"
    ) {
      return <XCircle size={14} />;
    }

    return <Clock size={14} />;
  };

  // ==========================================
  // ORDER STATUS STYLE
  // ==========================================

  const getStatusClass = (status) => {
    if (status === "Completed") {
      return "bg-green-50 text-green-600";
    }

    if (
      status === "Cancelled" ||
      status === "Rejected"
    ) {
      return "bg-red-50 text-red-600";
    }

    if (
      status === "Accepted" ||
      status === "Ready"
    ) {
      return "bg-blue-50 text-blue-600";
    }

    return "bg-yellow-50 text-yellow-600";
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="min-h-[320px] rounded-xl border border-black/10 bg-white p-6">

      {/* ==========================================
          HEADER
      ========================================== */}

      <div className="flex items-start justify-between">

        <div>
          <h2 className="text-lg font-semibold text-black">
            Recent Orders
          </h2>

          <p className="mt-1 text-sm text-black/45">
            Latest customer orders
          </p>
        </div>

        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-black text-white">
          <ShoppingBag
            size={17}
            strokeWidth={1.8}
          />
        </div>

      </div>


      {/* ==========================================
          LOADING
      ========================================== */}

      {loading && (
        <div className="flex h-[220px] items-center justify-center">

          <p className="text-sm text-black/40">
            Loading orders...
          </p>

        </div>
      )}


      {/* ==========================================
          NO ORDERS
      ========================================== */}

      {!loading && orders.length === 0 && (
        <div className="flex h-[220px] items-center justify-center">

          <div className="text-center">

            <ShoppingBag
              size={28}
              className="mx-auto text-black/20"
            />

            <p className="mt-3 text-sm font-medium text-black/50">
              No orders yet
            </p>

            <p className="mt-1 text-xs text-black/30">
              Customer orders will appear here.
            </p>

          </div>

        </div>
      )}


      {/* ==========================================
          ORDERS LIST
      ========================================== */}

      {!loading && orders.length > 0 && (
        <div className="mt-6 space-y-3">

          {orders.slice(0, 5).map((order) => {

            // -------------------------------
            // CUSTOMER NAME
            // -------------------------------

            const customerName =
              order.user?.name ||
              order.shippingAddress?.name ||
              "Customer";


            // -------------------------------
            // TOTAL AMOUNT
            // -------------------------------

            const totalAmount =
              Number(order.totalAmount || 0);


            // -------------------------------
            // ORDER STATUS
            // -------------------------------

            const status =
              order.orderStatus ||
              order.status ||
              "Placed";


            // -------------------------------
            // ITEM COUNT
            // -------------------------------

            const itemCount =
              order.items?.reduce(
                (total, item) =>
                  total + Number(item.quantity || 0),
                0
              ) || 0;


            return (
              <div
                key={order._id}
                className="flex items-center justify-between gap-4 rounded-lg border border-black/5 bg-[#fafafa] px-4 py-3"
              >

                {/* ==================================
                    CUSTOMER
                ================================== */}

                <div className="min-w-0">

                  <p className="truncate text-sm font-semibold text-black">
                    {customerName}
                  </p>

                  <p className="mt-1 text-xs text-black/40">
                    {itemCount}{" "}
                    {itemCount === 1
                      ? "item"
                      : "items"}
                  </p>

                </div>


                {/* ==================================
                    AMOUNT + STATUS
                ================================== */}

                <div className="flex flex-col items-end gap-2">

                  <p className="text-sm font-semibold text-black">
                    ₹
                    {totalAmount.toLocaleString(
                      "en-IN"
                    )}
                  </p>

                  <span
                    className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold ${getStatusClass(
                      status
                    )}`}
                  >
                    {getStatusIcon(status)}
                    {status}
                  </span>

                </div>

              </div>
            );
          })}

        </div>
      )}

    </div>
  );
}