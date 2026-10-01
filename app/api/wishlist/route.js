import { NextResponse } from "next/server";
import connectDB from "../../lib/mongodb";
import Wishlist from "../../models/wishlist.schema";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

// ==========================================
// GET WISHLIST
// ==========================================

export async function GET(req) {
  try {
    await connectDB();

    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ success: false, message: "Please login first" }, { status: 401 });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return NextResponse.json({ success: false, message: "Invalid or expired token" }, { status: 401 });
    }

    const userId = new mongoose.Types.ObjectId(decoded.id);

    // Fetch user's wishlist
    const wishlistDoc = await Wishlist.findOne({ user: userId }).populate("products");
    const productsList = wishlistDoc ? wishlistDoc.products : [];

    return NextResponse.json({
      success: true,
      wishlist: productsList,
      count: productsList.length,
    });
  } catch (error) {
    console.error("Wishlist GET server error:", error);
    return NextResponse.json({ success: false, message: error.message || "Server error" }, { status: 500 });
  }
}

// ==========================================
// ADD / REMOVE WISHLIST (TOGGLE)
// ==========================================

export async function POST(req) {
  try {
    await connectDB();

    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ success: false, message: "Please login first" }, { status: 401 });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return NextResponse.json({ success: false, message: "Invalid or expired token" }, { status: 401 });
    }

    const userId = new mongoose.Types.ObjectId(decoded.id);
    const body = await req.json();
    const { productId } = body;

    if (!productId) {
      return NextResponse.json({ success: false, message: "Product is required" }, { status: 400 });
    }

    const prodObjId = new mongoose.Types.ObjectId(productId);

    // Find wishlist for current user
    let wishlistDoc = await Wishlist.findOne({ user: userId });
    let action = "";

    if (!wishlistDoc) {
      // Create new wishlist if it doesn't exist
      wishlistDoc = await Wishlist.create({
        user: userId,
        products: [prodObjId],
      });
      action = "added";
    } else {
      // Check if product is already in wishlist
      const isAlreadyAdded = wishlistDoc.products.some(
        (id) => id.toString() === prodObjId.toString()
      );

      if (isAlreadyAdded) {
        // Remove product from array
        wishlistDoc = await Wishlist.findOneAndUpdate(
          { user: userId },
          { $pull: { products: prodObjId } },
          { new: true }
        );

        // If wishlist is empty, delete document completely
        if (wishlistDoc && wishlistDoc.products.length === 0) {
          await Wishlist.findOneAndDelete({ user: userId });
          
          return NextResponse.json({
            success: true,
            action: "removed",
            message: "Removed from wishlist",
            wishlist: [],
          });
        }

        action = "removed";
      } else {
        // Add product to array without duplication
        wishlistDoc = await Wishlist.findOneAndUpdate(
          { user: userId },
          { $addToSet: { products: prodObjId } },
          { new: true }
        );
        action = "added";
      }
    }

    return NextResponse.json({
      success: true,
      action: action,
      message: action === "added" ? "Added to wishlist" : "Removed from wishlist",
      wishlist: wishlistDoc ? wishlistDoc.products : [],
    });
  } catch (error) {
    console.error("Wishlist POST server error:", error);
    return NextResponse.json({ success: false, message: error.message || "Server error" }, { status: 500 });
  }
}