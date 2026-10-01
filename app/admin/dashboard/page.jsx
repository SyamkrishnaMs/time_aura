"use client";

import { useState } from "react";

import Sidebar from "./components/sidebar.jsx";
import DashboardOverview from "./components/dashboardOverview.jsx";
import Users from "./components/users.jsx";
import BlockedUsers from "./components/blockedUsers.jsx";

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState("dashboard");

  return (
    <div className="min-h-screen bg-[#f8f8f1]">

      <Sidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />

      <main className="ml-64 p-8">

        {activeSection === "dashboard" && (
          <DashboardOverview />
        )}

        {activeSection === "users" && (
          <Users />
        )}

        {activeSection === "blockedUsers" && (
          <BlockedUsers />
        )}

      </main>

    </div>
  );
}