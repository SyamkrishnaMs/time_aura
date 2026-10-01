
"use client";

import { useEffect, useState } from "react";
import axios from "axios";

import {
  Mail,
  Phone,
  Users as UsersIcon,
  Ban,
} from "lucide-react";

export default function BlockedUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unblockingUser, setUnblockingUser] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchBlockedUsers();
  }, []);

  // ==========================================
  // GET BLOCKED USERS
  // ==========================================

  const fetchBlockedUsers = async () => {
    try {
      const response = await axios.get(
        "/api/admin/user?status=blocked"
      );

      console.log("BLOCKED USERS RESPONSE:", response.data);

      if (response.data.success) {
        setUsers(response.data.users || []);
      }
    } catch (error) {
      console.error(
        "Failed to fetch blocked users:",
        error
      );

      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // UNBLOCK USER
  // ==========================================

  const handleUnblockUser = async (userId) => {
    try {
      setUnblockingUser(userId);
      setMessage("");

      const response = await axios.put(
        "/api/admin/user",
        {
          userId,
          isBlocked: false,
        }
      );

      console.log(
        "UNBLOCK RESPONSE:",
        response.data
      );

      if (response.data.success) {
        setUsers((prevUsers) =>
          prevUsers.filter(
            (user) => user._id !== userId
          )
        );

        setMessage(
          "User unblocked successfully"
        );
      }
    } catch (error) {
      console.error(
        "UNBLOCK USER ERROR:",
        error
      );

      setMessage(
        error.response?.data?.message ||
          "Failed to unblock user"
      );
    } finally {
      setUnblockingUser(null);
    }
  };

  return (
    <section className="space-y-8">

      {/* Header */}

      <div>
        <p className="mt-10 text-xs font-medium uppercase tracking-[0.2em] text-black/40">
          Customer Management
        </p>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-black">
          Blocked Users
        </h1>

        <p className="mt-2 text-sm text-black/50">
          View and manage blocked customers.
        </p>
      </div>

      {/* Message */}

      {message && (
        <div className="rounded-lg border border-black/10 bg-white px-4 py-3 text-sm text-black/60">
          {message}
        </div>
      )}

      {/* Total Blocked Users */}

      <div className="w-full rounded-xl border border-black/10 bg-white p-5">
        <div className="flex items-center gap-4">

          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-black text-white">
            <Ban
              size={19}
              strokeWidth={1.8}
            />
          </div>

          <div>
            <p className="text-xs font-medium text-black/40">
              Total Blocked Users
            </p>

            <p className="mt-1 text-2xl font-semibold text-black">
              {loading ? "..." : users.length}
            </p>
          </div>

        </div>
      </div>

      {/* Users Table */}

      <div className="overflow-hidden rounded-xl border border-black/10 bg-white">

        <div className="overflow-x-auto">

          <table className="w-full min-w-[950px]">

            <thead>
              <tr className="border-b border-black/10 bg-[#fafafa]">

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-black/40">
                  User
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-black/40">
                  Email
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-black/40">
                  Phone
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-black/40">
                  Role
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-black/40">
                  Joined
                </th>

                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-black/40">
                  Action
                </th>

              </tr>
            </thead>

            <tbody>

              {/* Loading */}

              {loading ? (

                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-16 text-center"
                  >
                    <p className="text-sm text-black/40">
                      Loading blocked users...
                    </p>
                  </td>
                </tr>

              ) : users.length === 0 ? (

                /* Empty */

                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-16 text-center"
                  >

                    <Ban
                      size={30}
                      strokeWidth={1.5}
                      className="mx-auto text-black/20"
                    />

                    <p className="mt-3 text-sm font-medium text-black/50">
                      No blocked users
                    </p>

                    <p className="mt-1 text-xs text-black/30">
                      Blocked users will appear here.
                    </p>

                  </td>
                </tr>

              ) : (

                /* Users */

                users.map((user) => (

                  <tr
                    key={user._id}
                    className="border-b border-black/5 last:border-0 transition-colors hover:bg-[#fafafa]"
                  >

                    {/* User */}

                    <td className="px-6 py-4">

                      <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black text-sm font-semibold text-white">
                          {user.name
                            ? user.name
                                .charAt(0)
                                .toUpperCase()
                            : "U"}
                        </div>

                        <div className="min-w-0">

                          <p className="truncate text-sm font-semibold text-black">
                            {user.name ||
                              "Unnamed User"}
                          </p>

                          <p className="mt-1 max-w-[180px] truncate text-xs text-black/35">
                            {user._id}
                          </p>

                        </div>

                      </div>

                    </td>

                    {/* Email */}

                    <td className="px-6 py-4">

                      {user.email ? (

                        <div className="flex items-center gap-2 text-sm text-black/65">

                          <Mail
                            size={14}
                            strokeWidth={1.7}
                          />

                          <span>
                            {user.email}
                          </span>

                        </div>

                      ) : (

                        <span className="text-sm text-black/30">
                          No email
                        </span>

                      )}

                    </td>

                    {/* Phone */}

                    <td className="px-6 py-4">

                      {user.phone ? (

                        <div className="flex items-center gap-2 text-sm text-black/65">

                          <Phone
                            size={14}
                            strokeWidth={1.7}
                          />

                          <span>
                            {user.phone}
                          </span>

                        </div>

                      ) : (

                        <span className="text-sm text-black/30">
                          No phone
                        </span>

                      )}

                    </td>

                    {/* Role */}

                    <td className="px-6 py-4">

                      <span className="rounded-full bg-black/5 px-3 py-1 text-xs font-medium capitalize text-black/60">
                        {user.role || "customer"}
                      </span>

                    </td>

                    {/* Joined */}

                    <td className="px-6 py-4">

                      <span className="text-sm text-black/55">
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

                    </td>

                    {/* Unblock */}

                    <td className="px-6 py-4 text-right">

                      <button
                        onClick={() =>
                          handleUnblockUser(
                            user._id
                          )
                        }
                        disabled={
                          unblockingUser ===
                          user._id
                        }
                        className="inline-flex items-center gap-2 rounded-lg border border-black/10 px-3 py-2 text-xs font-medium text-black/70 transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                      >

                        <Ban
                          size={14}
                          strokeWidth={1.8}
                        />

                        {unblockingUser ===
                        user._id
                          ? "Unblocking..."
                          : "Unblock"}

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