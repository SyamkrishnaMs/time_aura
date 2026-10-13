"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  ShoppingBag,
  Clock,
  CheckCircle,
  XCircle,
  CreditCard,
  Package,
  User,
  Mail,
  Hash,
  Wallet,
} from "lucide-react";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // FETCH ALL ORDERS
  // ==========================================

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await axios.get(
          "/api/admin/order"
        );

        console.log("ALL ORDERS:", response.data);

        if (response.data.success) {
          setOrders(response.data.orders || []);
        } else {
          setError(
            response.data.message ||
              "Failed to load orders"
          );
        }
      } catch (error) {
        console.error("FETCH ORDERS ERROR:", error);

        setError(
          error.response?.data?.message ||
            "Failed to load orders"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // ==========================================
  // STATUS ICON
  // ==========================================

  const getStatusIcon = (status) => {
    if (status === "Completed") {
      return <CheckCircle size={15} />;
    }

    if (
      status === "Cancelled" ||
      status === "Rejected"
    ) {
      return <XCircle size={15} />;
    }

    if (
      status === "Accepted" ||
      status === "Ready"
    ) {
      return <CheckCircle size={15} />;
    }

    return <Clock size={15} />;
  };

  // ==========================================
  // STATUS STYLE
  // ==========================================

  const getStatusClass = (status) => {
    if (status === "Completed") {
      return "bg-emerald-100 text-emerald-700 border border-emerald-200";
    }

    if (
      status === "Cancelled" ||
      status === "Rejected"
    ) {
      return "bg-red-100 text-red-700 border border-red-200";
    }

    if (status === "Accepted") {
      return "bg-blue-100 text-blue-700 border border-blue-200";
    }

    if (status === "Ready") {
      return "bg-indigo-100 text-indigo-700 border border-indigo-200";
    }

    if (status === "Placed") {
      return "bg-amber-100 text-amber-700 border border-amber-200";
    }

    return "bg-gray-100 text-gray-700 border border-gray-200";
  };

  // ==========================================
  // PAYMENT STATUS STYLE
  // ==========================================

  const getPaymentStatusClass = (status) => {
    if (
      status === "Paid" ||
      status === "Completed"
    ) {
      return "bg-emerald-50 text-emerald-700 border border-emerald-200";
    }

    if (
      status === "Failed" ||
      status === "Cancelled"
    ) {
      return "bg-red-50 text-red-700 border border-red-200";
    }

    return "bg-amber-50 text-amber-700 border border-amber-200";
  };

  // ==========================================
  // PAYMENT METHOD STYLE
  // ==========================================

  const getPaymentMethodClass = (method) => {
    if (
      method?.toLowerCase().includes("google") ||
      method?.toLowerCase().includes("upi") ||
      method?.toLowerCase().includes("razorpay")
    ) {
      return "bg-purple-50 text-purple-700 border border-purple-200";
    }

    if (
      method?.toLowerCase().includes("card")
    ) {
      return "bg-blue-50 text-blue-700 border border-blue-200";
    }

    if (
      method?.toLowerCase().includes("cod") ||
      method?.toLowerCase().includes("cash")
    ) {
      return "bg-orange-50 text-orange-700 border border-orange-200";
    }

    return "bg-gray-50 text-gray-700 border border-gray-200";
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="rounded-2xl border border-black/10 bg-white p-8 shadow-sm">

        <div className="flex items-center gap-3">

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white">
            <ShoppingBag size={19} />
          </div>

          <div>
            <h2 className="text-lg font-semibold">
              Orders
            </h2>

            <p className="text-sm text-black/40">
              Loading customer orders...
            </p>
          </div>

        </div>

      </div>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6">

        <div className="flex items-center gap-3">

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-600">
            <XCircle size={20} />
          </div>

          <div>
            <h3 className="font-semibold text-red-700">
              Unable to load orders
            </h3>

            <p className="mt-1 text-sm text-red-600">
              {error}
            </p>
          </div>

        </div>

      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* ==========================================
          HEADER
      ========================================== */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-black text-white shadow-sm">
              <ShoppingBag size={20} />
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-black">
                Orders
              </h2>

              <p className="mt-1 text-sm text-black/45">
                Manage all customer orders
              </p>
            </div>

          </div>
        </div>


        {/* TOTAL ORDERS */}

        <div className="flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 px-5 py-3">

          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
            <Package size={18} />
          </div>

          <div>
            <p className="text-lg font-bold text-blue-700">
              {orders.length}
            </p>

            <p className="text-xs font-medium text-blue-500">
              Total Orders
            </p>
          </div>

        </div>

      </div>


      {/* ==========================================
          NO ORDERS
      ========================================== */}

      {orders.length === 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-14 text-center shadow-sm">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <ShoppingBag
              size={30}
              className="text-gray-400"
            />
          </div>

          <p className="mt-5 text-base font-semibold text-gray-700">
            No orders found
          </p>

          <p className="mt-1 text-sm text-gray-400">
            Customer orders will appear here.
          </p>

        </div>
      )}


      {/* ==========================================
          ORDERS
      ========================================== */}

      {orders.length > 0 && (
        <div className="space-y-5">

          {orders.map((order, index) => {

            const customerName =
              order.user?.name ||
              order.shippingAddress?.name ||
              "Customer";

            const customerEmail =
              order.user?.email || "";

            const itemCount =
              order.items?.reduce(
                (total, item) =>
                  total +
                  Number(item.quantity || 0),
                0
              ) || 0;

            const totalAmount =
              Number(order.totalAmount || 0);

            const status =
              order.orderStatus ||
              order.status ||
              "Placed";

            const paymentMethod =
              order.paymentMethod ||
              "Not specified";

            const paymentStatus =
              order.paymentStatus ||
              "Pending";

            return (
              <div
                key={order._id}
                className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm transition hover:shadow-md"
              >

                {/* ==================================
                    COLOURED TOP BORDER
                ================================== */}

                <div
                  className={`h-1.5 ${
                    status === "Completed"
                      ? "bg-emerald-500"
                      : status === "Cancelled" ||
                        status === "Rejected"
                      ? "bg-red-500"
                      : status === "Accepted" ||
                        status === "Ready"
                      ? "bg-blue-500"
                      : "bg-amber-400"
                  }`}
                />


                <div className="p-6">

                  {/* ==================================
                      TOP SECTION
                  ================================== */}

                  <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

                    {/* CUSTOMER */}

                    <div className="flex items-start gap-4">

                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
                        <User size={21} />
                      </div>

                      <div>

                        <p className="text-base font-semibold text-black">
                          {customerName}
                        </p>

                        {customerEmail && (
                          <div className="mt-1 flex items-center gap-1.5 text-xs text-black/45">

                            <Mail size={13} />

                            <span>
                              {customerEmail}
                            </span>

                          </div>
                        )}

                        <div className="mt-2 flex items-center gap-1.5 text-xs text-black/35">

                          <Hash size={13} />

                          <span>
                            {order._id}
                          </span>

                        </div>

                      </div>

                    </div>


                    {/* STATUS */}

                    <span
                      className={`flex w-fit items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold ${getStatusClass(
                        status
                      )}`}
                    >
                      {getStatusIcon(status)}
                      {status}
                    </span>

                  </div>


                  {/* ==================================
                      ORDER INFORMATION
                  ================================== */}

                  <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">

                    {/* ITEMS */}

                    <div className="rounded-xl border border-purple-100 bg-purple-50 p-4">

                      <div className="flex items-center gap-2">

                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                          <Package size={16} />
                        </div>

                        <span className="text-xs font-medium text-purple-500">
                          Items
                        </span>

                      </div>

                      <p className="mt-3 text-lg font-bold text-purple-700">
                        {itemCount}
                      </p>

                    </div>


                    {/* TOTAL */}

                    <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">

                      <div className="flex items-center gap-2">

                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                          <Wallet size={16} />
                        </div>

                        <span className="text-xs font-medium text-emerald-500">
                          Total
                        </span>

                      </div>

                      <p className="mt-3 text-lg font-bold text-emerald-700">
                        ₹
                        {totalAmount.toLocaleString(
                          "en-IN"
                        )}
                      </p>

                    </div>


                    {/* PAYMENT */}

                    <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">

                      <div className="flex items-center gap-2">

                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                          <CreditCard size={16} />
                        </div>

                        <span className="text-xs font-medium text-blue-500">
                          Payment
                        </span>

                      </div>

                      <p className="mt-3 truncate text-sm font-bold text-blue-700">
                        {paymentMethod}
                      </p>

                    </div>


                    {/* PAYMENT STATUS */}

                    <div className="rounded-xl border border-orange-100 bg-orange-50 p-4">

                      <div className="flex items-center gap-2">

                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
                          <CheckCircle size={16} />
                        </div>

                        <span className="text-xs font-medium text-orange-500">
                          Payment Status
                        </span>

                      </div>

                      <span
                        className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getPaymentStatusClass(
                          paymentStatus
                        )}`}
                      >
                        {paymentStatus}
                      </span>

                    </div>

                  </div>


                  {/* ==================================
                      PRODUCTS
                  ================================== */}

                  <div className="mt-6">

                    <div className="mb-3 flex items-center justify-between">

                      <p className="text-sm font-semibold text-black">
                        Products
                      </p>

                      <span className="text-xs text-black/35">
                        {itemCount}{" "}
                        {itemCount === 1
                          ? "item"
                          : "items"}
                      </span>

                    </div>


                    <div className="space-y-2">

                      {order.items?.map(
                        (item, itemIndex) => {

                          const product =
                            item.product;

                          const itemPrice =
                            Number(
                              item.price ||
                                product?.offerPrice ||
                                product?.price ||
                                0
                            );

                          return (
                            <div
                              key={
                                item._id ||
                                itemIndex
                              }
                              className="flex flex-col gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4 sm:flex-row sm:items-center sm:justify-between"
                            >

                              {/* PRODUCT */}

                              <div className="flex items-center gap-3">

                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-gray-500 shadow-sm">
                                  <ShoppingBag
                                    size={17}
                                  />
                                </div>

                                <div>

                                  <p className="text-sm font-semibold text-gray-800">
                                    {product?.name ||
                                      "Product"}
                                  </p>

                                  <p className="mt-1 text-xs text-gray-400">
                                    {product?.brand ||
                                      "Time Aura"}
                                    {" · "}
                                    Qty:{" "}
                                    {item.quantity ||
                                      1}
                                  </p>

                                </div>

                              </div>


                              {/* PRICE */}

                              <p className="text-sm font-bold text-gray-800">
                                ₹
                                {itemPrice.toLocaleString(
                                  "en-IN"
                                )}
                              </p>

                            </div>
                          );
                        }
                      )}

                    </div>

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