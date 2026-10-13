import connectDB from "../../../lib/mongodb";
import Order from "../../../models/order.schema";

export async function GET() {
  try {
    await connectDB();

    const payments = await Order.find({
      paymentMethod: "Razorpay",
    })
      .populate("user", "name email phone")
      .populate(
        "items.product",
        "name brand price offerPrice image images"
      )
      .sort({ createdAt: -1 });

    return Response.json(
      {
        success: true,
        payments,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("ADMIN PAYMENT ERROR:", error);

    return Response.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}