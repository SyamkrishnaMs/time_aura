
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import User from "../../../models/user.schema.js";
import connectDB from "../../../lib/mongodb";

export async function GET(req) {
  try {
    // Connect to MongoDB
    await connectDB();

    // Get JWT token from the httpOnly cookie
    const token = req.cookies.get("token")?.value;

    // Check if token exists
    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Not logged in",
        },
        { status: 401 }
      );
    }

    // Verify the JWT token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // Find the user using the ID from the token
    const user = await User.findById(decoded.id).select(
      "-password"
    );

    // Check if user exists
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    // Check if the user is blocked
    if (user.isBlocked) {
      return NextResponse.json(
        {
          success: false,
          blocked: true,
          message:
            "Your account has been temporarily blocked by the administrator.",
        },
        { status: 403 }
      );
    }

    // Return active user details
    return NextResponse.json({
      success: true,
      user: {
        name: user.name,
        email: user.email,
        id: user._id,
      },
    });
  } catch (error) {
    console.error("AUTH ME ERROR:", error);

    // Handle invalid or expired token
    return NextResponse.json(
      {
        success: false,
        message: "Invalid token",
      },
      { status: 401 }
    );
  }
}

