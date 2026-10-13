import connectDB from "../../../lib/mongodb";
import Order from "../../../models/order.schema";
import jwt from "jsonwebtoken";

export async function GET(req) {
  try {
    await connectDB();

    // ==========================================
    // GET JWT FROM HTTP ONLY COOKIE
    // ==========================================

    const token = req.cookies.get("token")?.value;

    if (!token) {
      return Response.json(
        {
          success: false,
          message: "Please login first",
        },
        { status: 401 }
      );
    }

    // ==========================================
    // VERIFY TOKEN
    // ==========================================

    let decoded;

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return Response.json(
        {
          success: false,
          message: "Invalid or expired token",
        },
        { status: 401 }
      );
    }

    // ==========================================
    // GET USER ID
    // ==========================================

    const userId = decoded.id || decoded.userId;

    if (!userId) {
      return Response.json(
        {
          success: false,
          message: "Invalid user token",
        },
        { status: 401 }
      );
    }

    // ==========================================
    // GET ONLY LOGGED-IN USER ORDERS
    // ==========================================

    const orders = await Order.find({
      user: userId,
    })
      .populate("user", "name email")
      .populate(
        "items.product",
        "name brand price offerPrice image images"
      )
      .sort({ createdAt: -1 });

    // ==========================================
    // RESPONSE
    // ==========================================

    return Response.json(
      {
        success: true,
        orders,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET USER ORDERS ERROR:", error);

    return Response.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}