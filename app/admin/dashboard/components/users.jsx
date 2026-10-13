"use client";

import { useEffect, useState } from "react";
import axios from "axios";

import {
  Mail,
  Phone,
  Users as UsersIcon,
  Ban,
  UserCheck,
  CalendarDays,
  ShieldCheck,
} from "lucide-react";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [blockingUser, setBlockingUser] = useState(null);
  const [message, setMessage] = useState("");

  // ==========================================
  // GET ALL ACTIVE USERS
  // ==========================================

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        "/api/admin/user?status=active"
      );

      console.log("USERS RESPONSE:", response.data);

      if (response.data.success) {
        setUsers(response.data.users || []);
      }
    } catch (error) {
      console.error(
        "Failed to fetch users:",
        error
      );

      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // BLOCK USER
  // ==========================================

  const handleBlockUser = async (userId) => {
    try {
      setBlockingUser(userId);
      setMessage("");

      const response = await axios.put(
        "/api/admin/user",
        {
          userId,
          isBlocked: true,
        }
      );

      console.log(
        "BLOCK RESPONSE:",
        response.data
      );

      if (response.data.success) {
        setUsers((prevUsers) =>
          prevUsers.filter(
            (user) => user._id !== userId
          )
        );

        setMessage(
          "User blocked successfully"
        );
      }
    } catch (error) {
      console.error(
        "BLOCK USER ERROR:",
        error
      );

      setMessage(
        error.response?.data?.message ||
          "Failed to block user"
      );
    } finally {
      setBlockingUser(null);
    }
  };

  // ==========================================
  // ROLE STYLE
  // ==========================================

  const getRoleStyle = (role) => {
    if (role === "admin") {
      return "bg-purple-100 text-purple-700 border border-purple-200";
    }

    if (role === "business") {
      return "bg-blue-100 text-blue-700 border border-blue-200";
    }

    return "bg-emerald-100 text-emerald-700 border border-emerald-200";
  };

  return (
    <section className="space-y-8">

      {/* ==========================================
          HEADER
      ========================================== */}

      <div className="mt-10">

        <div className="flex items-center gap-3">

          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
            <UsersIcon
              size={22}
              strokeWidth={1.8}
            />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-500">
              Customer Management
            </p>

            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-black">
              All Users
            </h1>
          </div>

        </div>

        <p className="mt-3 text-sm text-black/50">
          View and manage all registered customers.
        </p>

      </div>


      {/* ==========================================
          MESSAGE
      ========================================== */}

      {message && (
        <div
          className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm ${
            message.includes("successfully")
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >

          <div
            className={`flex h-8 w-8 items-center justify-center rounded-lg ${
              message.includes("successfully")
                ? "bg-emerald-100"
                : "bg-red-100"
            }`}
          >
            {message.includes("successfully") ? (
              <UserCheck size={16} />
            ) : (
              <Ban size={16} />
            )}
          </div>

          <span>{message}</span>

        </div>
      )}


      {/* ==========================================
          TOTAL USERS CARD
      ========================================== */}

      <div className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 shadow-sm">

        <div className="flex items-center justify-between">

          <div className="flex items-center gap-4">

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
              <UsersIcon
                size={21}
                strokeWidth={1.8}
              />
            </div>

            <div>

              <p className="text-xs font-semibold uppercase tracking-wider text-blue-500">
                Active Customers
              </p>

              <p className="mt-1 text-3xl font-bold text-blue-900">
                {loading
                  ? "..."
                  : users.length}
              </p>

            </div>

          </div>


          <div className="hidden rounded-xl bg-white/70 px-4 py-3 sm:block">

            <p className="text-xs text-blue-500">
              Account Status
            </p>

            <div className="mt-1 flex items-center gap-2">

              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />

              <span className="text-sm font-semibold text-emerald-700">
                Active
              </span>

            </div>

          </div>

        </div>

      </div>


      {/* ==========================================
          USERS TABLE
      ========================================== */}

      <div className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm">

        {/* TABLE HEADER */}

        <div className="border-b border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4">

          <div className="flex items-center justify-between">

            <div>

              <h2 className="text-base font-semibold text-blue-950">
                Registered Users
              </h2>

              <p className="mt-1 text-xs text-blue-600/70">
                Active customers in your store
              </p>

            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
              <ShieldCheck size={17} />
            </div>

          </div>

        </div>


        <div className="overflow-x-auto">

          <table className="w-full min-w-[1000px]">

            {/* ==================================
                TABLE HEAD
            ================================== */}

            <thead>

              <tr className="border-b border-black/10 bg-gray-50">

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  User
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Email
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Phone
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Role
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Joined
                </th>

                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Action
                </th>

              </tr>

            </thead>


            {/* ==================================
                TABLE BODY
            ================================== */}

            <tbody>

              {/* LOADING */}

              {loading ? (
                <tr>

                  <td
                    colSpan="6"
                    className="px-6 py-20 text-center"
                  >

                    <div className="flex flex-col items-center">

                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-500">

                        <UsersIcon
                          size={21}
                          className="animate-pulse"
                        />

                      </div>

                      <p className="mt-4 text-sm font-medium text-blue-700">
                        Loading users...
                      </p>

                      <p className="mt-1 text-xs text-black/35">
                        Please wait
                      </p>

                    </div>

                  </td>

                </tr>

              ) : users.length === 0 ? (

                /* NO USERS */

                <tr>

                  <td
                    colSpan="6"
                    className="px-6 py-20 text-center"
                  >

                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                      <UsersIcon
                        size={27}
                        strokeWidth={1.5}
                        className="text-gray-400"
                      />
                    </div>

                    <p className="mt-4 text-sm font-semibold text-gray-600">
                      No users found
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      Registered users will appear here.
                    </p>

                  </td>

                </tr>

              ) : (

                /* USERS */

                users.map((user) => (

                  <tr
                    key={user._id}
                    className="border-b border-black/5 last:border-0 transition-all hover:bg-blue-50/40"
                  >

                    {/* ==============================
                        USER
                    ============================== */}

                    <td className="px-6 py-5">

                      <div className="flex items-center gap-3">

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-bold text-white shadow-sm">

                          {user.name
                            ? user.name
                                .charAt(0)
                                .toUpperCase()
                            : "U"}

                        </div>


                        <div className="min-w-0">

                          <p className="truncate text-sm font-semibold text-gray-800">
                            {user.name ||
                              "Unnamed User"}
                          </p>

                          <p className="mt-1 max-w-[180px] truncate text-xs text-gray-400">
                            {user._id}
                          </p>

                        </div>

                      </div>

                    </td>


                    {/* ==============================
                        EMAIL
                    ============================== */}

                    <td className="px-6 py-5">

                      {user.email ? (

                        <div className="flex items-center gap-2">

                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                            <Mail
                              size={14}
                              strokeWidth={1.7}
                            />
                          </div>

                          <span className="text-sm text-gray-600">
                            {user.email}
                          </span>

                        </div>

                      ) : (

                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-400">
                          No email
                        </span>

                      )}

                    </td>


                    {/* ==============================
                        PHONE
                    ============================== */}

                    <td className="px-6 py-5">

                      {user.phone ? (

                        <div className="flex items-center gap-2">

                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                            <Phone
                              size={14}
                              strokeWidth={1.7}
                            />
                          </div>

                          <span className="text-sm text-gray-600">
                            {user.phone}
                          </span>

                        </div>

                      ) : (

                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-400">
                          No phone
                        </span>

                      )}

                    </td>


                    {/* ==============================
                        ROLE
                    ============================== */}

                    <td className="px-6 py-5">

                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${getRoleStyle(
                          user.role
                        )}`}
                      >

                        <span className="h-1.5 w-1.5 rounded-full bg-current" />

                        {user.role ||
                          "customer"}

                      </span>

                    </td>


                    {/* ==============================
                        JOINED
                    ============================== */}

                    <td className="px-6 py-5">

                      <div className="flex items-center gap-2">

                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                          <CalendarDays
                            size={14}
                          />
                        </div>

                        <span className="text-sm text-gray-600">

                          {user.createdAt
                            ? new Date(
                                user.createdAt
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


                    {/* ==============================
                        BLOCK
                    ============================== */}

                    <td className="px-6 py-5 text-right">

                      <button
                        type="button"
                        onClick={() =>
                          handleBlockUser(
                            user._id
                          )
                        }
                        disabled={
                          blockingUser ===
                          user._id
                        }
                        className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2 text-xs font-semibold text-red-600 transition-all hover:border-red-300 hover:bg-red-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                      >

                        <Ban
                          size={14}
                          strokeWidth={1.8}
                        />

                        {blockingUser ===
                        user._id
                          ? "Blocking..."
                          : "Block"}

                      </button>

                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>

      </div>

    </section>
  );
}