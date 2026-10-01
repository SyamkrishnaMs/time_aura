import { NextResponse } from "next/server";
import connectDB from "@/app/lib/mongodb.js";
import User from "@/app/models/user.schema";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    await connectDB();

    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Complete fields",
        },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Email already exists",
        },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "customer",
      isBlocked: false,
    });console.log("NEW USER FROM DATABASE:", newUser);
console.log("IS BLOCKED:", newUser.isBlocked);

    return NextResponse.json(
      {
        success: true,
        message: "Registration successful",
        data: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          isBlocked: newUser.isBlocked,
        },
      },
      { status: 201 }
    );
    
  } catch (error) {
    console.error("REGISTRATION ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}