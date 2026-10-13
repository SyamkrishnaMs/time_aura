"use client";

import { useEffect, useState } from "react";
import axios from "axios";

import {
  CreditCard,
  User,
  Mail,
  Phone,
  Package,
  IndianRupee,
  CheckCircle2,
  Clock3,
  XCircle,
  RotateCcw,
  Receipt,
  CalendarDays,
} from "lucide-react";

export default function Payment() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // ==========================================
  // GET RAZORPAY PAYMENTS
  // ==========================================

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setMessage("");

      const response = await axios.get(
        "/api/admin/payment"
      );

      console.log(
        "RAZORPAY PAYMENTS RESPONSE:",
        response.data
      );

      if (response.data.success) {
        setPayments(response.data.payments || []);
      }
    } catch (error) {
      console.error(
        "GET PAYMENTS ERROR:",
        error
      );

      setPayments([]);

      setMessage(
        error.response?.data?.message ||
          "Failed to load payments"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  // ==========================================
  // PAYMENT STATUS STYLE
  // ==========================================

  const getPaymentStatus = (status) => {
    if (status === "Paid") {
      return {
        style:
          "bg-emerald-100 text-emerald-700 border-emerald-200",
        icon: CheckCircle2,
      };
    }

    if (status === "Failed") {
      return {
        style:
          "bg-red-100 text-red-700 border-red-200",
        icon: XCircle,
      };
    }

    if (status === "Refunded") {
      return {
        style:
          "bg-purple-100 text-purple-700 border-purple-200",
        icon: RotateCcw,
      };
    }

    return {
      style:
        "bg-amber-100 text-amber-700 border-amber-200",
      icon: Clock3,
    };
  };

  // ==========================================
  // TOTAL RAZORPAY AMOUNT
  // ==========================================

  const totalAmount = payments.reduce(
    (total, payment) => {
      if (payment.paymentStatus === "Paid") {
        return total + Number(payment.totalAmount || 0);
      }

      return total;
    },
    0
  );

  return (
    <section className="space-y-8">

      {/* ==========================================
          HEADER
      ========================================== */}

      <div className="mt-10">

        <div className="flex items-center gap-3">

          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
            <CreditCard
              size={22}
              strokeWidth={1.8}
            />
          </div>

          <div>

            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-purple-500">
              Payment Management
            </p>

            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-black">
              Razorpay Payments
            </h1>

          </div>

        </div>

        <p className="mt-3 text-sm text-black/50">
          View Razorpay payments with customer and product details.
        </p>

      </div>

      {/* ==========================================
          MESSAGE
      ========================================== */}

      {message && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {message}
        </div>
      )}

      {/* ==========================================
          SUMMARY CARDS
      ========================================== */}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">

        {/* Total Payments */}

        <div className="rounded-2xl border border-purple-100 bg-gradient-to-br from-purple-50 to-indigo-50 p-6 shadow-sm">

          <div className="flex items-center gap-4">

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-600 text-white">
              <Receipt size={21} />
            </div>

            <div>

              <p className="text-xs font-semibold uppercase tracking-wider text-purple-500">
                Razorpay Orders
              </p>

              <p className="mt-1 text-3xl font-bold text-purple-900">
                {loading ? "..." : payments.length}
              </p>

            </div>

          </div>

        </div>

        {/* Paid Payments */}

        <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-green-50 p-6 shadow-sm">

          <div className="flex items-center gap-4">

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-white">
              <CheckCircle2 size={21} />
            </div>

            <div>

              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-500">
                Paid Payments
              </p>

              <p className="mt-1 text-3xl font-bold text-emerald-900">
                {loading
                  ? "..."
                  : payments.filter(
                      (payment) =>
                        payment.paymentStatus ===
                        "Paid"
                    ).length}
              </p>

            </div>

          </div>

        </div>

        {/* Total Amount */}

        <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-cyan-50 p-6 shadow-sm">

          <div className="flex items-center gap-4">

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white">
              <IndianRupee size={21} />
            </div>

            <div>

              <p className="text-xs font-semibold uppercase tracking-wider text-blue-500">
                Total Paid Amount
              </p>

              <p className="mt-1 text-2xl font-bold text-blue-900">
                ₹{totalAmount.toLocaleString("en-IN")}
              </p>

            </div>

          </div>

        </div>

      </div>

      {/* ==========================================
          PAYMENT TABLE
      ========================================== */}

      <div className="overflow-hidden rounded-2xl border border-purple-100 bg-white shadow-sm">

        {/* Table Header */}

        <div className="border-b border-purple-100 bg-gradient-to-r from-purple-50 to-indigo-50 px-6 py-4">

          <div className="flex items-center justify-between">

            <div>

              <h2 className="text-base font-semibold text-purple-950">
                Razorpay Transactions
              </h2>

              <p className="mt-1 text-xs text-purple-600/70">
                Customer and product payment details
              </p>

            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
              <CreditCard size={17} />
            </div>

          </div>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full min-w-[1250px]">

            {/* ======================================
                TABLE HEAD
            ====================================== */}

            <thead>

              <tr className="border-b border-black/10 bg-gray-50">

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Customer
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Product
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Order ID
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Razorpay ID
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Amount
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Status
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Date
                </th>

              </tr>

            </thead>

            {/* ======================================
                TABLE BODY
            ====================================== */}

            <tbody>

              {loading ? (

                <tr>

                  <td
                    colSpan="7"
                    className="px-6 py-20 text-center"
                  >

                    <div className="flex flex-col items-center">

                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-50 text-purple-500">

                        <CreditCard
                          size={21}
                          className="animate-pulse"
                        />

                      </div>

                      <p className="mt-4 text-sm font-medium text-purple-700">
                        Loading payments...
                      </p>

                      <p className="mt-1 text-xs text-gray-400">
                        Please wait
                      </p>

                    </div>

                  </td>

                </tr>

              ) : payments.length === 0 ? (

                <tr>

                  <td
                    colSpan="7"
                    className="px-6 py-20 text-center"
                  >

                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-purple-50 text-purple-400">

                      <CreditCard
                        size={27}
                        strokeWidth={1.5}
                      />

                    </div>

                    <p className="mt-4 text-sm font-semibold text-gray-600">
                      No Razorpay payments found
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      Razorpay transactions will appear here.
                    </p>

                  </td>

                </tr>

              ) : (

                payments.map((payment) => {

                  const status =
                    getPaymentStatus(
                      payment.paymentStatus
                    );

                  const StatusIcon =
                    status.icon;

                  return (

                    <tr
                      key={payment._id}
                      className="border-b border-black/5 last:border-0 transition-all hover:bg-purple-50/30"
                    >

                      {/* ==================================
                          CUSTOMER
                      ================================== */}

                      <td className="px-6 py-5">

                        <div className="flex items-center gap-3">

                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-sm font-bold text-white shadow-sm">

                            {payment.user?.name
                              ? payment.user.name
                                  .charAt(0)
                                  .toUpperCase()
                              : "U"}

                          </div>

                          <div className="min-w-0">

                            <p className="truncate text-sm font-semibold text-gray-800">
                              {payment.user?.name ||
                                "Unknown User"}
                            </p>

                            {payment.user?.email && (

                              <div className="mt-1 flex items-center gap-1.5">

                                <Mail
                                  size={12}
                                  className="text-purple-500"
                                />

                                <span className="max-w-[180px] truncate text-xs text-gray-400">
                                  {payment.user.email}
                                </span>

                              </div>

                            )}

                          </div>

                        </div>

                      </td>

                      {/* ==================================
                          PRODUCT
                      ================================== */}

                      <td className="px-6 py-5">

                        <div className="space-y-2">

                          {payment.items?.map(
                            (item, index) => (

                              <div
                                key={`${payment._id}-${index}`}
                                className="flex items-center gap-3"
                              >

                                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-gray-100">

                                  {item.image ? (

                                    <img
                                      src={item.image}
                                      alt={item.name}
                                      className="h-full w-full object-cover"
                                    />

                                  ) : (

                                    <div className="flex h-full w-full items-center justify-center text-gray-400">

                                      <Package
                                        size={16}
                                      />

                                    </div>

                                  )}

                                </div>

                                <div className="min-w-0">

                                  <p className="max-w-[220px] truncate text-sm font-semibold text-gray-800">
                                    {item.name}
                                  </p>

                                  <p className="mt-1 text-xs text-gray-400">
                                    {item.brand || "Watch"} • Qty:{" "}
                                    {item.quantity}
                                  </p>

                                </div>

                              </div>

                            )
                          )}

                        </div>

                      </td>

                      {/* ==================================
                          ORDER ID
                      ================================== */}

                      <td className="px-6 py-5">

                        <div className="flex items-center gap-2">

                          <Receipt
                            size={15}
                            className="text-indigo-500"
                          />

                          <span className="max-w-[150px] truncate font-mono text-xs text-gray-600">
                            {payment._id}
                          </span>

                        </div>

                      </td>

                      {/* ==================================
                          RAZORPAY ID
                      ================================== */}

                      <td className="px-6 py-5">

                        {payment.razorpayPaymentId ? (

                          <div className="rounded-lg bg-purple-50 px-3 py-2">

                            <p className="max-w-[180px] truncate font-mono text-xs font-medium text-purple-700">
                              {payment.razorpayPaymentId}
                            </p>

                          </div>

                        ) : (

                          <span className="text-xs text-gray-400">
                            Not available
                          </span>

                        )}

                      </td>

                      {/* ==================================
                          AMOUNT
                      ================================== */}

                      <td className="px-6 py-5">

                        <div className="flex items-center gap-1">

                          <IndianRupee
                            size={15}
                            className="text-emerald-600"
                          />

                          <span className="text-base font-bold text-emerald-700">
                            {Number(
                              payment.totalAmount || 0
                            ).toLocaleString("en-IN")}
                          </span>

                        </div>

                      </td>

                      {/* ==================================
                          STATUS
                      ================================== */}

                      <td className="px-6 py-5">

                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${status.style}`}
                        >

                          <StatusIcon
                            size={13}
                          />

                          {payment.paymentStatus}

                        </span>

                      </td>

                      {/* ==================================
                          DATE
                      ================================== */}

                      <td className="px-6 py-5">

                        <div className="flex items-center gap-2">

                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">

                            <CalendarDays
                              size={14}
                            />

                          </div>

                          <span className="text-sm text-gray-600">

                            {payment.createdAt
                              ? new Date(
                                  payment.createdAt
                                ).toLocaleDateString(
                                  "en-IN",
                                  {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  }
                                )
                              : "-"}

                          </span>

                        </div>

                      </td>

                    </tr>

                  );
                })

              )}

            </tbody>

          </table>

        </div>

      </div>

    </section>
  );
}