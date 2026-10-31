import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

import connectDB from "../../../lib/mongodb";
import User from "../../../models/user.schema.js";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("adminToken")?.value;

    // Login cheythittillenkil
    if (!token) {
      return NextResponse.json(
        { success: false, isAdmin: false },
        { status: 401 }
      );
    }

    if (!process.env.JWT_SECRET) {
      return NextResponse.json(
        { success: false, message: "Server configuration error" },
        { status: 500 }
      );
    }

    // Verify JWT token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // Token-il admin role illenkil
    if (!decoded.id || decoded.role !== "admin") {
      return NextResponse.json(
        { success: false, isAdmin: false },
        { status: 403 }
      );
    }

    await connectDB();

    // Database-il current role verify cheyyuka
    const user = await User.findById(decoded.id)
      .select("_id name email role");

    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { success: false, isAdmin: false },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      isAdmin: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Admin verification error:", error);

    return NextResponse.json(
      { success: false, isAdmin: false },
      { status: 401 }
    );
  }
}