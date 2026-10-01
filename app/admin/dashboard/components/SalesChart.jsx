
"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { IndianRupee, TrendingUp } from "lucide-react";

export default function SalesChart() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      const response = await axios.get("/api/admin/sales");

      if (response.data.success) {
        setSales(response.data.sales || []);
      }
    } catch (error) {
      console.error("Failed to fetch sales:", error);
      setSales([]);
    } finally {
      setLoading(false);
    }
  };

  const maxRevenue =
    sales.length > 0
      ? Math.max(...sales.map((item) => Number(item.revenue || 0)))
      : 0;

  return (
    <div className="rounded-xl border border-black/10 bg-white p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-black text-white">
              <TrendingUp size={17} strokeWidth={1.8} />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-black">
                Sales Overview
              </h2>

              <p className="mt-0.5 text-sm text-black/45">
                Monthly revenue performance
              </p>
            </div>
          </div>
        </div>

        {sales.length > 0 && (
          <div className="text-right">
            <p className="text-xs text-black/40">
              Total Revenue
            </p>

            <p className="mt-1 flex items-center justify-end text-lg font-semibold text-black">
              <IndianRupee size={16} />
              {sales
                .reduce(
                  (total, item) =>
                    total + Number(item.revenue || 0),
                  0
                )
                .toLocaleString("en-IN")}
            </p>
          </div>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex h-[250px] items-center justify-center">
          <p className="text-sm text-black/40">
            Loading sales data...
          </p>
        </div>
      )}

      {/* No Data */}
      {!loading && sales.length === 0 && (
        <div className="flex h-[250px] items-center justify-center">
          <div className="text-center">
            <TrendingUp
              size={28}
              className="mx-auto text-black/20"
            />

            <p className="mt-3 text-sm font-medium text-black/50">
              No sales data available
            </p>

            <p className="mt-1 text-xs text-black/30">
              Paid orders will appear here.
            </p>
          </div>
        </div>
      )}

      {/* Chart */}
      {!loading && sales.length > 0 && (
        <div className="mt-8">
          <div className="flex h-[250px] items-end gap-3 overflow-x-auto border-b border-black/10 pb-0">
            {sales.map((item, index) => {
              const revenue = Number(item.revenue || 0);

              const height =
                maxRevenue > 0
                  ? Math.max((revenue / maxRevenue) * 200, 8)
                  : 8;

              return (
                <div
                  key={`${item.year}-${item.month}-${index}`}
                  className="flex min-w-[55px] flex-1 flex-col items-center justify-end"
                >
                  {/* Revenue */}
                  <p className="mb-2 text-[10px] font-semibold text-black/50">
                    ₹{revenue.toLocaleString("en-IN")}
                  </p>

                  {/* Bar */}
                  <div
                    className="w-full max-w-[42px] rounded-t-lg bg-black transition-all duration-500 hover:bg-black/75"
                    style={{
                      height: `${height}px`,
                    }}
                    title={`${item.monthName} ${item.year}: ₹${revenue.toLocaleString(
                      "en-IN"
                    )}`}
                  />

                  {/* Month */}
                  <p className="mt-3 text-xs font-medium text-black/45">
                    {item.monthName}
                  </p>

                  {/* Orders */}
                  <p className="mt-1 text-[10px] text-black/30">
                    {item.orders}{" "}
                    {item.orders === 1 ? "order" : "orders"}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

