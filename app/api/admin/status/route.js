import connectDB from "../../../lib/mongodb";
import User from "../../../models/user.schema.js";
import Product from "../../../models/product.Schema.js";
import Order from "../../../models/order.schema.js";

export async function GET() {
  try {
    await connectDB();

    const totalUsers = await User.countDocuments({
      role: { $ne: "admin" },
    });

    const totalProducts = await Product.countDocuments();

    const totalOrders = await Order.countDocuments();

    const revenueResult = await Order.aggregate([
      {
        $match: {
          paymentStatus: "Paid",
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: "$totalAmount",
          },
        },
      },
    ]);

    const totalRevenue =
      revenueResult.length > 0
        ? revenueResult[0].totalRevenue
        : 0;

    return Response.json(
      {
        success: true,
        stats: {
          totalUsers,
          totalProducts,
          totalOrders,
          totalRevenue,
        },
      },
      { status: 200 }
    );

  } catch (error) {
    return Response.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}