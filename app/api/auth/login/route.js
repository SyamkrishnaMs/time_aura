
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import connectDB from "../../../lib/mongodb";
import jwt from "jsonwebtoken";
import User from "../../../models/user.schema.js";

export async function POST(request) {
  try {
    await connectDB();

    const { email, password } = await request.json();

    const user = await User.findOne({ email });

    // User not found
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "email or password wrong",
        },
        { status: 401 }
      );
    }

    // Password check
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return NextResponse.json(
        {
          success: false,
          message: "password wrong",
        },
        { status: 401 }
      );
    }

    // Blocked user check
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

    // Create JWT
    const token = jwt.sign(
      {
        id: user._id.toString(),
        email: user.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    // Response
    const response = NextResponse.json({
      success: true,
      message: "login successful",
      user: {
        name: user.name,
        email: user.email,
      },
    });

    // Store JWT in httpOnly cookie
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "login failed",
      },
      { status: 500 }
    );
  }
}

