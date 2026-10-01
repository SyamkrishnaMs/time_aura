import connectDB from "../../../lib/mongodb";
import User from "../../../models/user.schema";

// ==========================================
// GET USERS
// ==========================================

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    let filter = {
      role: { $ne: "admin" },
    };

    if (status === "active") {
      filter.isBlocked = false;
    }

    if (status === "blocked") {
      filter.isBlocked = true;
    }

    const users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 });

    return Response.json(
      {
        success: true,
        users,
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
};

// ==========================================
// BLOCK / UNBLOCK USER
// ==========================================

export async function PUT(req) {
  try {
    await connectDB();

    const { userId, isBlocked } = await req.json();

    if (!userId) {
      return Response.json(
        {
          success: false,
          message: "User ID is required",
        },
        { status: 400 }
      );
    }

    const user = await User.findOneAndUpdate(
      {
        _id: userId,
        role: { $ne: "admin" },
      },
      {
        isBlocked: Boolean(isBlocked),
      },
      {
        new: true,
      }
    ).select("-password -otp -otpExpiry");

    if (!user) {
      return Response.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    return Response.json(
      {
        success: true,
        message: isBlocked
          ? "User blocked successfully"
          : "User unblocked successfully",
        user,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("BLOCK USER ERROR:", error);

    return Response.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}