"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Sidebar from "./components/sidebar.jsx";
import DashboardOverview from "./components/dashboardOverview.jsx";
import Users from "./components/users.jsx";
import BlockedUsers from "./components/blockedUsers.jsx";
import ProductManagement from "./components/product.jsx";
import Category from "./components/category.jsx";
import Orders from "./components/orders.jsx";
import Payment from "./components/payment.jsx";
import LandingPage from "./components/landingPage.jsx";

export default function AdminDashboard() {
  const router = useRouter();

  const [activeSection, setActiveSection] = useState("dashboard");
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function verifyAdmin() {
      try {
        const response = await fetch("/api/admin/verify", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        if (!response.ok) {
          router.replace("/admin/login");
          return;
        }

        const data = await response.json();

        // API response-il admin status verify cheyyanam.
        const authorized =
          data.isAdmin === true ||
          data.user?.role === "admin" ||
          data.role === "admin";

        if (!authorized) {
          router.replace("/admin/login");
          return;
        }

        if (!cancelled) {
          setIsAdmin(true);
        }
      } catch (error) {
        console.error("Admin verification failed:", error);
        router.replace("/admin/login");
      } finally {
        if (!cancelled) {
          setCheckingAdmin(false);
        }
      }
    }

    verifyAdmin();

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (checkingAdmin || !isAdmin) {
    return (
      <div className="min-h-screen bg-[#f8f8f1] flex items-center justify-center">
        <p className="text-gray-700 text-sm">
          Verifying admin access...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f8f1]">
      <Sidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />

      <main className="ml-64 p-8">
        {activeSection === "dashboard" && <DashboardOverview />}

        {activeSection === "users" && <Users />}

        {activeSection === "blockedUsers" && <BlockedUsers />}

        {activeSection === "product" && <ProductManagement />}

        {activeSection === "category" && <Category />}

        {activeSection === "orders" && <Orders />}

        {activeSection === "payments" && <Payment />}

        {activeSection === "landing" && <LandingPage />}
      </main>
    </div>
  );
}