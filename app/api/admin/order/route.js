import connectDB from "../../../lib/mongodb";
import Order from "../../../models/order.schema";

export async function GET() {
  try {
    await connectDB();

    const orders = await Order.find()
      .populate("user", "name email")
      .populate("items.product", "name brand price image")
      .sort({ createdAt: -1 });

    return Response.json(
      {
        success: true,
        orders,
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