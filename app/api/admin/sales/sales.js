import connectDB from "../../../lib/mongodb.js";
import Order from "../../../models/order.schema.js";

export async function GET() {
  try {
    await connectDB();

    const sales = await Order.aggregate([
      // Only paid orders
      {
        $match: {
          paymentStatus: "Paid",
        },
      },

      // Group orders month-wise
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },

          revenue: {
            $sum: "$totalAmount",
          },

          orders: {
            $sum: 1,
          },
        },
      },

      // Sort by year and month
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
        },
      },
    ]);

    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const formattedSales = sales.map((item) => ({
      year: item._id.year,
      month: item._id.month,
      monthName: monthNames[item._id.month - 1],
      revenue: item.revenue,
      orders: item.orders,
    }));

    return Response.json(
      {
        success: true,
        sales: formattedSales,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET SALES ERROR:", error);

    return Response.json(
      {
        success: false,
        message: error.message || "Failed to fetch sales",
      },
      { status: 500 }
    );
  }
}