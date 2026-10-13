import { NextResponse } from "next/server";
import crypto from "crypto";
import connectDB from "../../lib/mongodb";

import Cart from "../../models/cart.schema";
import Product from "../../models/product.Schema";
import Order from "../../models/order.schema";

import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import Razorpay from "razorpay";

// =====================================================
// RAZORPAY
// =====================================================

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// =====================================================
// GET USER ID FROM JWT COOKIE
// =====================================================

function getUserId(req) {
  const token = req.cookies.get("token")?.value;

  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const userId = decoded.id || decoded.userId;

    if (
      !userId ||
      !mongoose.Types.ObjectId.isValid(userId)
    ) {
      return null;
    }

    return userId;
  } catch (error) {
    console.error("JWT ERROR:", error.message);
    return null;
  }
}

// =====================================================
// GET CART DETAILS
// =====================================================

async function getCartDetails(userId) {
  const cart = await Cart.findOne({
    user: userId,
  }).populate("items.product");

  if (
    !cart ||
    !cart.items ||
    cart.items.length === 0
  ) {
    throw new Error("Your cart is empty");
  }

  const orderItems = [];
  let subtotal = 0;

  for (const cartItem of cart.items) {
    const product = cartItem.product;

    // =================================================
    // PRODUCT CHECK
    // =================================================

    if (!product) {
      throw new Error(
        "One of the products in your cart is no longer available"
      );
    }

    // =================================================
    // QUANTITY CHECK
    // =================================================

    const quantity = Number(
      cartItem.quantity || 0
    );

    if (quantity <= 0) {
      throw new Error(
        `Invalid quantity for ${product.name}`
      );
    }

    // =================================================
    // STOCK CHECK
    // =================================================

    if (
      typeof product.stock === "number" &&
      quantity > product.stock
    ) {
      throw new Error(
        `Only ${product.stock} ${product.name} available`
      );
    }

    // =================================================
    // SIZE CHECK
    // =================================================

    if (
      Array.isArray(product.size) &&
      product.size.length > 0 &&
      cartItem.size &&
      !product.size.includes(cartItem.size)
    ) {
      throw new Error(
        `${cartItem.size} size is not available for ${product.name}`
      );
    }

    // =================================================
    // PRICE
    // =================================================

    const price = Number(
      product.offerPrice ??
        product.price ??
        product.mrp ??
        0
    );

    if (price <= 0) {
      throw new Error(
        `Invalid price for ${product.name}`
      );
    }

    // =================================================
    // ITEM TOTAL
    // =================================================

    const itemTotal =
      price * quantity;

    subtotal += itemTotal;

    // =================================================
    // ORDER ITEM
    // =================================================

    orderItems.push({
      product: product._id,

      name: product.name,

      brand: product.brand || "",

      image:
        product.images?.[0] ||
        product.image ||
        "",

      size: cartItem.size || "",

      quantity,

      price,

      total: itemTotal,
    });
  }

  // =================================================
  // SHIPPING
  // =================================================

  const shipping = 0;

  // =================================================
  // TOTAL
  // =================================================

  const totalAmount =
    subtotal + shipping;

  if (totalAmount <= 0) {
    throw new Error(
      "Invalid order amount"
    );
  }

  return {
    cart,
    orderItems,
    subtotal,
    shipping,
    totalAmount,
  };
}

// =====================================================
// POST /api/order
// =====================================================

export async function POST(req) {
  try {
    // =================================================
    // CONNECT DATABASE
    // =================================================

    await connectDB();

    // =================================================
    // REQUEST BODY
    // =================================================

    const body = await req.json();

    const {
      action,
      paymentMethod,
      shippingAddress,

      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = body;

    // =================================================
    // AUTHENTICATION
    // =================================================

    const userId = getUserId(req);

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please login to continue",
        },
        { status: 401 }
      );
    }

    // =================================================
    // ADDRESS CHECK
    // =================================================

    if (!shippingAddress) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please select a delivery address",
        },
        { status: 400 }
      );
    }

    if (
      !shippingAddress.name ||
      !shippingAddress.phone ||
      !shippingAddress.addressLine ||
      !shippingAddress.city ||
      !shippingAddress.state ||
      !shippingAddress.pincode
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Complete delivery address is required",
        },
        { status: 400 }
      );
    }

    // =================================================
    // GET CART
    // =================================================

    const {
      cart,
      orderItems,
      subtotal,
      shipping,
      totalAmount,
    } = await getCartDetails(userId);

    // =====================================================
    // RAZORPAY - CREATE PAYMENT ORDER
    // =====================================================

    if (
      action === "create" &&
      paymentMethod === "Razorpay"
    ) {
      // =================================================
      // RAZORPAY ENV CHECK
      // =================================================

      if (
        !process.env.RAZORPAY_KEY_ID ||
        !process.env.RAZORPAY_KEY_SECRET
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Razorpay configuration is missing",
          },
          { status: 500 }
        );
      }

      try {
        // ===============================================
        // CREATE RAZORPAY ORDER
        // ===============================================

        const razorpayOrder =
          await razorpay.orders.create({
            amount: Math.round(
              totalAmount * 100
            ),

            currency: "INR",

            receipt: `receipt_${Date.now()}`,

            notes: {
              userId: String(userId),
            },
          });

        console.log(
          "RAZORPAY ORDER CREATED:",
          razorpayOrder.id
        );

        // ===============================================
        // SEND ORDER TO FRONTEND
        // ===============================================

        return NextResponse.json(
          {
            success: true,

            message:
              "Razorpay order created successfully",

            razorpayOrder: {
              id: razorpayOrder.id,

              amount:
                razorpayOrder.amount,

              currency:
                razorpayOrder.currency,
            },

            key:
              process.env
                .NEXT_PUBLIC_RAZORPAY_KEY_ID,
          },
          { status: 201 }
        );
      } catch (razorpayError) {
        // ===============================================
        // RAZORPAY ERROR
        // ===============================================

        console.error(
          "================================"
        );

        console.error(
          "RAZORPAY CREATE ERROR"
        );

        console.error(
          "MESSAGE:",
          razorpayError?.message
        );

        console.error(
          "DESCRIPTION:",
          razorpayError?.error?.description
        );

        console.error(
          "ERROR:",
          razorpayError
        );

        console.error(
          "================================"
        );

        return NextResponse.json(
          {
            success: false,

            message:
              razorpayError?.error
                ?.description ||
              razorpayError?.message ||
              "Razorpay order creation failed",
          },
          { status: 500 }
        );
      }
    }

    // =====================================================
    // RAZORPAY - VERIFY PAYMENT
    // =====================================================

    if (
      action === "verify" &&
      paymentMethod === "Razorpay"
    ) {
      // =================================================
      // PAYMENT DETAILS CHECK
      // =================================================

      if (
        !razorpay_order_id ||
        !razorpay_payment_id ||
        !razorpay_signature
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Razorpay payment details are missing",
          },
          { status: 400 }
        );
      }

      // =================================================
      // SECRET KEY CHECK
      // =================================================

      if (
        !process.env.RAZORPAY_KEY_SECRET
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Razorpay secret key is missing",
          },
          { status: 500 }
        );
      }

      // =================================================
      // CREATE SIGNATURE
      // =================================================

      const generatedSignature =
        crypto
          .createHmac(
            "sha256",
            process.env.RAZORPAY_KEY_SECRET
          )
          .update(
            `${razorpay_order_id}|${razorpay_payment_id}`
          )
          .digest("hex");

      // =================================================
      // VERIFY SIGNATURE
      // =================================================

      if (
        generatedSignature !==
        razorpay_signature
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Payment verification failed",
          },
          { status: 400 }
        );
      }

      // =================================================
      // SAVE RAZORPAY ORDER TO DATABASE
      // =================================================

      const order =
        await Order.create({
          user: userId,

          items: orderItems,

          shippingAddress: {
            name: shippingAddress.name,

            phone: shippingAddress.phone,

            addressLine:
              shippingAddress.addressLine,

            city:
              shippingAddress.city,

            state:
              shippingAddress.state,

            pincode:
              shippingAddress.pincode,
          },

          paymentMethod: "Razorpay",

          paymentStatus: "Paid",

          orderStatus: "Placed",

          subtotal,

          shipping,

          totalAmount,
        });

      // =================================================
      // DECREASE PRODUCT STOCK
      // =================================================

      for (const cartItem of cart.items) {
        const product =
          cartItem.product;

        if (
          typeof product.stock === "number"
        ) {
          await Product.findByIdAndUpdate(
            product._id,

            {
              $inc: {
                stock:
                  -Number(
                    cartItem.quantity
                  ),
              },
            }
          );
        }
      }

      // =================================================
      // CLEAR CART
      // =================================================

      cart.items = [];

      await cart.save();

      // =================================================
      // PAYMENT SUCCESS
      // =================================================

      return NextResponse.json(
        {
          success: true,

          message:
            "Payment successful and order placed",

          order: {
            _id: order._id,

            paymentMethod:
              order.paymentMethod,

            paymentStatus:
              order.paymentStatus,

            orderStatus:
              order.orderStatus,

            totalAmount:
              order.totalAmount,
          },
        },
        { status: 201 }
      );
    }

    // =====================================================
    // COD - CREATE ORDER
    // =====================================================

    if (
      action === "create" &&
      paymentMethod === "COD"
    ) {
      // =================================================
      // SAVE COD ORDER
      // =================================================

      const order =
        await Order.create({
          user: userId,

          items: orderItems,

          shippingAddress: {
            name: shippingAddress.name,

            phone: shippingAddress.phone,

            addressLine:
              shippingAddress.addressLine,

            city:
              shippingAddress.city,

            state:
              shippingAddress.state,

            pincode:
              shippingAddress.pincode,
          },

          paymentMethod: "COD",

          paymentStatus: "Pending",

          orderStatus: "Placed",

          subtotal,

          shipping,

          totalAmount,
        });

      // =================================================
      // DECREASE PRODUCT STOCK
      // =================================================

      for (const cartItem of cart.items) {
        const product =
          cartItem.product;

        if (
          typeof product.stock === "number"
        ) {
          await Product.findByIdAndUpdate(
            product._id,

            {
              $inc: {
                stock:
                  -Number(
                    cartItem.quantity
                  ),
              },
            }
          );
        }
      }

      // =================================================
      // CLEAR CART
      // =================================================

      cart.items = [];

      await cart.save();

      // =================================================
      // COD SUCCESS
      // =================================================

      return NextResponse.json(
        {
          success: true,

          message:
            "COD order placed successfully",

          order: {
            _id: order._id,

            paymentMethod:
              order.paymentMethod,

            paymentStatus:
              order.paymentStatus,

            orderStatus:
              order.orderStatus,

            totalAmount:
              order.totalAmount,
          },
        },
        { status: 201 }
      );
    }

    // =====================================================
    // INVALID REQUEST
    // =====================================================

    return NextResponse.json(
      {
        success: false,

        message:
          "Invalid order request",
      },
      { status: 400 }
    );
  } catch (error) {
    // =====================================================
    // MAIN ERROR
    // =====================================================

    console.error(
      "================================"
    );

    console.error(
      "ORDER API ERROR"
    );

    console.error(
      "MESSAGE:",
      error.message
    );

    console.error(
      "NAME:",
      error.name
    );

    console.error(
      "STACK:",
      error.stack
    );

    console.error(
      "================================"
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error.message ||
          "Unable to process order",
      },
      { status: 500 }
    );
  }
}
// ==========================================
// GET MY ORDERS
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
          message: "Please login to view your orders",
        },
        { status: 401 }
      );
    }

    // Verify token
    let decoded;

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          message: "Session expired. Please login again",
        },
        { status: 401 }
      );
    }

    const userId = decoded.id || decoded.userId;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid user",
        },
        { status: 401 }
      );
    }

    // Get logged-in user's orders
    const orders = await Order.find({
      user: userId,
    })
      .populate(
        "items.product",
        "name brand images image"
      )
      .sort({
        createdAt: -1,
      });

    return NextResponse.json(
      {
        success: true,
        orders,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("MY ORDERS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch orders",
      },
      { status: 500 }
    );
  }
}