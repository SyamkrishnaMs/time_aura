import connectDB from "../../lib/mongodb.js";
import Product from "../../models/product.Schema.js"

// =========================
// CREATE PRODUCT
// =========================
export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();

    const product = await Product.create(body);

    return Response.json(
      {
        success: true,
        message: "Product added successfully",
        product,
      },
      { status: 201 }
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
}


// =========================
// GET ALL PRODUCTS
// =========================
export async function GET() {
  try {
    await connectDB();

    const products = await Product.find();

    return Response.json(
      {
        success: true,
        products,
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
}


// =========================
// UPDATE PRODUCT
// =========================
export async function PUT(req) {
  try {
    await connectDB();

    const body = await req.json();

    const { id, ...updateData } = body;

    const product = await Product.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!product) {
      return Response.json(
        {
          success: false,
          message: "Product not found",
        },
        { status: 404 }
      );
    }

    return Response.json(
      {
        success: true,
        message: "Product updated successfully",
        product,
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
}


// =========================
// DELETE PRODUCT
// =========================
export async function DELETE(req) {
  try {
    await connectDB();

    const body = await req.json();

    const product = await Product.findByIdAndDelete(body.id);

    if (!product) {
      return Response.json(
        {
          success: false,
          message: "Product not found",
        },
        { status: 404 }
      );
    }

    return Response.json(
      {
        success: true,
        message: "Product deleted successfully",
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
}