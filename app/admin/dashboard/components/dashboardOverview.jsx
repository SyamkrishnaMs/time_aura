
"use client";

import { useEffect, useState } from "react";
import axios from "axios";

import {
  Users,
  Package,
  ShoppingBag,
  IndianRupee,
} from "lucide-react";

import SalesChart from "./SalesChart";
import RecentOrders from "./recentOrder";
           
           
import BlockedUsers from "./blockedUsers";

export default function DashboardOverview() {
  // ==========================================
  // DASHBOARD STATS
  // ==========================================

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });

  const [loading, setLoading] = useState(true);

  // ==========================================
  // FETCH DASHBOARD STATS
  // ==========================================

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get("/api/admin/status");

        console.log("ADMIN STATS RESPONSE:", response.data);

        if (response.data.success) {
          setStats(response.data.stats);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // ==========================================
  // STAT CARDS
  // ==========================================

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
    },
    {
      title: "Total Products",
      value: stats.totalProducts,
      icon: Package,
    },
    {
      title: "Total Orders",
      value: stats.totalOrders,
      icon: ShoppingBag,
    },
    {
      title: "Total Revenue",
      value: `₹${Number(
        stats.totalRevenue || 0
      ).toLocaleString("en-IN")}`,
      icon: IndianRupee,
    },
  ];

  return (
    <section className="space-y-8">

      {/* ==========================================
          PAGE HEADER
      ========================================== */}

      <div>
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-black/40">
          Admin Dashboard
        </p>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-black">
          Overview
        </h1>

        <p className="mt-2 text-sm text-black/50">
          Monitor your store performance and manage your business.
        </p>
      </div>

      {/* ==========================================
          STAT CARDS
      ========================================== */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

        {statCards.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="rounded-xl border border-black/10 bg-white p-5 transition-all duration-200 hover:border-black/20 hover:shadow-sm"
            >
              <div className="flex items-start justify-between">

                <div>
                  <p className="text-xs font-medium text-black/45">
                    {item.title}
                  </p>

                  <h2 className="mt-3 text-2xl font-semibold tracking-tight text-black">
                    {loading ? "..." : item.value}
                  </h2>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-black text-white">
                  <Icon
                    size={18}
                    strokeWidth={1.7}
                  />
                </div>

              </div>
            </div>
          );
        })}

      </div>

      {/* ==========================================
          BOTTOM SECTIONS
      ========================================== */}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* ========================================
            SALES OVERVIEW
        ======================================== */}

        <SalesChart />

        {/* ========================================
            RECENT ORDERS
        ======================================== */}

        <div className="min-h-[320px] rounded-xl border border-black/10 bg-white p-6">

          <div>
           <RecentOrders/>

            <p className="mt-1 text-sm text-black/45">
              Latest customer orders
            </p>
          </div>

         

        </div>

      </div>


      <div>   </div>

    </section>
  );
}

