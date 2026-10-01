"use client";

import {
  LayoutDashboard,
  Package,
  Tags,
  ShoppingBag,
  Users,
  UserX,
  Flag,
  CreditCard,
} from "lucide-react";

export default function Sidebar({
  activeSection,
  setActiveSection,
}) {
  const menuItems = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
      section: "dashboard",
    },
    {
      name: "Products",
      icon: Package,
      section: "products",
    },
    {
      name: "Categories",
      icon: Tags,
      section: "categories",
    },
    {
      name: "Orders",
      icon: ShoppingBag,
      section: "orders",
    },
    {
      name: "Users",
      icon: Users,
      section: "users",
    },
    {
      name: "Blocked Users",
      icon: UserX,
      section: "blockedUsers",
    },
    {
      name: "Reports & Complaints",
      icon: Flag,
      section: "reports",
    },
    {
      name: "Payments",
      icon: CreditCard,
      section: "payments",
    },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-black p-5 text-white">

      <div className="mb-8">
        <h1 className="text-xl font-semibold">
          Time Aura
        </h1>

        <p className="mt-1 text-xs text-white/40">
          Admin Panel
        </p>
      </div>

      <nav className="space-y-1">

        {menuItems.map((item) => {
          const Icon = item.icon;

          const isActive =
            activeSection === item.section;

          return (
            <button
              key={item.name}
              onClick={() => setActiveSection(item.section)}
              className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm transition-all ${
                isActive
                  ? "bg-white text-black"
                  : "text-white/60 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon
                size={18}
                strokeWidth={1.8}
              />

              <span>{item.name}</span>
            </button>
          );
        })}

      </nav>

    </aside>
  );
}