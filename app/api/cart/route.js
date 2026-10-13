import { NextResponse } from "next/server";
import connectDB from "../../lib/mongodb";
import Cart from "../../models/cart.schema";
import Product from "../../models/product.Schema";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

// ==========================================
// GET CART
// ==========================================

export async function GET(req) {
  try {
    await connectDB();

    // Get JWT from httpOnly cookie
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Please login first",
        },
        { status: 401 }
      );
    }

    // Verify JWT
    let decoded;

    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
      );
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or expired token",
        },
        { status: 401 }
      );
    }

    // Validate user ID
    if (
      !decoded.id ||
      !mongoose.Types.ObjectId.isValid(decoded.id)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid user",
        },
        { status: 401 }
      );
    }

    const userId = new mongoose.Types.ObjectId(
      decoded.id
    );

    // Find user cart
    const cart = await Cart.findOne({
      user: userId,
    }).populate("items.product");

    // No cart
    if (!cart) {
      return NextResponse.json({
        success: true,
        cart: null,
        items: [],
        count: 0,
      });
    }

    return NextResponse.json({
      success: true,
      cart,
      items: cart.items,
      count: cart.items.length,
    });
  } catch (error) {
    console.error("Cart GET server error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Server error",
      },
      { status: 500 }
    );
  }
};

// ==========================================
// ADD TO CART
// ==========================================

export async function POST(req) {
  try {
    await connectDB();

    // ========================================
    // GET JWT
    // ========================================

    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Please login first",
        },
        { status: 401 }
      );
    }

    // ========================================
    // VERIFY JWT
    // ========================================

    let decoded;

    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
      );
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or expired token",
        },
        { status: 401 }
      );
    }

    // ========================================
    // VALIDATE USER
    // ========================================

    if (
      !decoded.id ||
      !mongoose.Types.ObjectId.isValid(decoded.id)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid user",
        },
        { status: 401 }
      );
    }

    const userId = new mongoose.Types.ObjectId(
      decoded.id
    );

    // ========================================
    // GET BODY
    // ========================================

    const body = await req.json();

    const {
      productId,
      quantity = 1,
      size,
    } = body;

    // ========================================
    // VALIDATE PRODUCT ID
    // ========================================

    if (!productId) {
      return NextResponse.json(
        {
          success: false,
          message: "Product is required",
        },
        { status: 400 }
      );
    }

    if (
      !mongoose.Types.ObjectId.isValid(productId)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid product ID",
        },
        { status: 400 }
      );
    }

    // ========================================
    // VALIDATE SIZE
    // ========================================

    if (!size) {
      return NextResponse.json(
        {
          success: false,
          message: "Size is required",
        },
        { status: 400 }
      );
    }

    // ========================================
    // VALIDATE QUANTITY
    // ========================================

    const requestedQuantity = Number(quantity);

    if (
      !Number.isInteger(requestedQuantity) ||
      requestedQuantity < 1
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid quantity",
        },
        { status: 400 }
      );
    }

    // ========================================
    // FIND PRODUCT
    // ========================================

    const product = await Product.findById(productId);

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found",
        },
        { status: 404 }
      );
    }

    // ========================================
    // CHECK STOCK
    // ========================================

    if (
      product.stock === undefined ||
      product.stock === null
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Product stock is not available",
        },
        { status: 400 }
      );
    }

    if (product.stock <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Product is out of stock",
        },
        { status: 400 }
      );
    }

    // ========================================
    // CHECK SIZE
    // ========================================

    if (
      Array.isArray(product.size) &&
      !product.size.includes(size)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Selected size is not available",
        },
        { status: 400 }
      );
    }

    // ========================================
    // FIND USER CART
    // ========================================

    let cart = await Cart.findOne({
      user: userId,
    });

    // ========================================
    // CREATE NEW CART
    // ========================================

    if (!cart) {
      if (requestedQuantity > product.stock) {
        return NextResponse.json(
          {
            success: false,
            message: `Only ${product.stock} items available`,
          },
          { status: 400 }
        );
      }

      cart = await Cart.create({
        user: userId,
        items: [
          {
            product: productId,
            quantity: requestedQuantity,
            size: size,
          },
        ],
      });

      await cart.populate("items.product");

      return NextResponse.json(
        {
          success: true,
          message: "Added to cart",
          cart,
          items: cart.items,
          count: cart.items.length,
        },
        { status: 201 }
      );
    }

    // ========================================
    // CHECK EXISTING PRODUCT
    // ========================================
    // IMPORTANT:
    // Only productId is checked.
    // Size is NOT checked here.
    //
    // So:
    // Rolex + Small  -> 1 item
    // Rolex + Medium -> same item
    // Rolex + Large  -> same item
    //
    // Quantity increases.
    // Latest selected size replaces old size.
    // ========================================

    const existingItem = cart.items.find((item) => {
      const existingProductId = String(
        item.product?._id || item.product
      );

      return (
        existingProductId === String(productId)
      );
    });

    // ========================================
    // PRODUCT ALREADY EXISTS
    // ========================================

    if (existingItem) {
      const newQuantity =
        existingItem.quantity +
        requestedQuantity;

      // Check stock
      if (newQuantity > product.stock) {
        return NextResponse.json(
          {
            success: false,
            message: `Only ${product.stock} items available`,
          },
          { status: 400 }
        );
      }

      // Increase quantity
      existingItem.quantity = newQuantity;

      // Update to latest selected size
      existingItem.size = size;

      await cart.save();

      await cart.populate("items.product");

      return NextResponse.json({
        success: true,
        message: "Cart quantity updated",
        cart,
        items: cart.items,
        count: cart.items.length,
      });
    }

    // ========================================
    // NEW PRODUCT
    // ========================================

    if (requestedQuantity > product.stock) {
      return NextResponse.json(
        {
          success: false,
          message: `Only ${product.stock} items available`,
        },
        { status: 400 }
      );
    }

    cart.items.push({
      product: productId,
      quantity: requestedQuantity,
      size: size,
    });

    await cart.save();

    await cart.populate("items.product");

    return NextResponse.json({
      success: true,
      message: "Added to cart",
      cart,
      items: cart.items,
      count: cart.items.length,
    });
  } catch (error) {
    console.error("Cart POST server error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Server error",
      },
      { status: 500 }
    );
  }
};

// ==========================================
// UPDATE CART QUANTITY
// ==========================================

export async function PUT(req) {
  try {
    await connectDB();

    // ========================================
    // GET JWT
    // ========================================

    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Please login first",
        },
        { status: 401 }
      );
    }

    // ========================================
    // VERIFY JWT
    // ========================================

    let decoded;

    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
      );
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or expired token",
        },
        { status: 401 }
      );
    }

    // ========================================
    // VALIDATE USER
    // ========================================

    if (
      !decoded.id ||
      !mongoose.Types.ObjectId.isValid(decoded.id)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid user",
        },
        { status: 401 }
      );
    }

    const userId = new mongoose.Types.ObjectId(
      decoded.id
    );

    // ========================================
    // GET BODY
    // ========================================

    const body = await req.json();

    const {
      cartItemId,
      quantity,
    } = body;

    if (!cartItemId) {
      return NextResponse.json(
        {
          success: false,
          message: "Cart item is required",
        },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(cartItemId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid cart item",
        },
        { status: 400 }
      );
    }

    const newQuantity = Number(quantity);

    if (
      !Number.isInteger(newQuantity) ||
      newQuantity < 1
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid quantity",
        },
        { status: 400 }
      );
    }

    // ========================================
    // FIND CART
    // ========================================

    const cart = await Cart.findOne({
      user: userId,
    });

    if (!cart) {
      return NextResponse.json(
        {
          success: false,
          message: "Cart not found",
        },
        { status: 404 }
      );
    }

    // ========================================
    // FIND CART ITEM
    // ========================================

    const cartItem = cart.items.id(cartItemId);

    if (!cartItem) {
      return NextResponse.json(
        {
          success: false,
          message: "Cart item not found",
        },
        { status: 404 }
      );
    }

    // ========================================
    // FIND PRODUCT
    // ========================================

    const product = await Product.findById(
      cartItem.product
    );

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found",
        },
        { status: 404 }
      );
    }

    // ========================================
    // CHECK STOCK
    // ========================================

    if (newQuantity > product.stock) {
      return NextResponse.json(
        {
          success: false,
          message: `Only ${product.stock} items available`,
        },
        { status: 400 }
      );
    }

    // ========================================
    // UPDATE QUANTITY
    // ========================================

    cartItem.quantity = newQuantity;

    await cart.save();

    await cart.populate("items.product");

    return NextResponse.json({
      success: true,
      message: "Cart updated",
      cart,
      items: cart.items,
      count: cart.items.length,
    });
  } catch (error) {
    console.error("Cart PUT server error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Server error",
      },
      { status: 500 }
    );
  }
};

// ==========================================
// DELETE CART ITEM
// ==========================================

export async function DELETE(req) {
  try {
    await connectDB();

    // ========================================
    // GET JWT
    // ========================================

    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Please login first",
        },
        { status: 401 }
      );
    }

    // ========================================
    // VERIFY JWT
    // ========================================

    let decoded;

    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
      );
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or expired token",
        },
        { status: 401 }
      );
    }

    // ========================================
    // VALIDATE USER
    // ========================================

    if (
      !decoded.id ||
      !mongoose.Types.ObjectId.isValid(decoded.id)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid user",
        },
        { status: 401 }
      );
    }

    const userId = new mongoose.Types.ObjectId(
      decoded.id
    );

    // ========================================
    // GET BODY
    // ========================================

    const body = await req.json();

    const { cartItemId } = body;

    if (!cartItemId) {
      return NextResponse.json(
        {
          success: false,
          message: "Cart item is required",
        },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(cartItemId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid cart item",
        },
        { status: 400 }
      );
    }

    // ========================================
    // FIND CART
    // ========================================

    const cart = await Cart.findOne({
      user: userId,
    });

    if (!cart) {
      return NextResponse.json(
        {
          success: false,
          message: "Cart not found",
        },
        { status: 404 }
      );
    }

    // ========================================
    // FIND ITEM
    // ========================================

    const itemIndex = cart.items.findIndex(
      (item) =>
        item._id.toString() === cartItemId
    );

    if (itemIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          message: "Cart item not found",
        },
        { status: 404 }
      );
    }

    // ========================================
    // REMOVE ITEM
    // ========================================

    cart.items.splice(itemIndex, 1);

    await cart.save();

    await cart.populate("items.product");

    return NextResponse.json({
      success: true,
      message: "Removed from cart",
      cart,
      items: cart.items,
      count: cart.items.length,
    });
  } catch (error) {
    console.error(
      "Cart DELETE server error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Server error",
      },
      { status: 500 }
    );
  }
}