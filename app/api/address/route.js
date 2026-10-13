import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "../../lib/mongodb";
import Address from "../../models/adress.schema";


// ===============================
// GET ALL ADDRESSES
// ===============================
export async function GET(req) {
  try {
    await connectDB();

    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Please login",
        },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const userId = decoded.id;

    const addresses = await Address.find({
      user: userId,
    }).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      addresses,
    });
  } catch (error) {
    console.error("GET ADDRESS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to get addresses",
      },
      { status: 500 }
    );
  }
}


// ===============================
// ADD NEW ADDRESS
// ===============================
export async function POST(req) {
  try {
    await connectDB();

    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Please login",
        },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const userId = decoded.id;

    const body = await req.json();

    const {
      name,
      phone,
      addressLine,
      city,
      state,
      pincode,
    } = body;

    if (
      !name ||
      !phone ||
      !addressLine ||
      !city ||
      !state ||
      !pincode
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "All address fields are required",
        },
        { status: 400 }
      );
    }

    if (!/^\d{10}$/.test(phone)) {
      return NextResponse.json(
        {
          success: false,
          message: "Phone number must be 10 digits",
        },
        { status: 400 }
      );
    }

    if (!/^\d{6}$/.test(pincode)) {
      return NextResponse.json(
        {
          success: false,
          message: "Pincode must be 6 digits",
        },
        { status: 400 }
      );
    }

    const address = await Address.create({
      user: userId,
      name,
      phone,
      addressLine,
      city,
      state,
      pincode,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Address added successfully",
        address,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("ADD ADDRESS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to add address",
      },
      { status: 500 }
    );
  }
}