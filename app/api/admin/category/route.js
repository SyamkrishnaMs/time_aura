import connectDB from "../../../lib/mongodb.js";
import Product from "../../../models/product.Schema.js";

// ==========================================
// GET PRODUCTS
// ==========================================
export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);

    const gender = searchParams.get("gender");
    const brand = searchParams.get("brand");
    const category = searchParams.get("category");
    const color = searchParams.get("color");
    const size = searchParams.get("size");

    const filter = {};

    // =========================
    // GENDER FILTER
    // =========================
    if (gender) {
      filter.gender = gender;
    }

    // =========================
    // BRAND FILTER
    // =========================
    if (brand) {
      filter.brand = brand;
    }

    // =========================
    // CATEGORY FILTER
    // =========================
    if (category) {
      filter.category = category;
    }

    // =========================
    // COLOR FILTER
    // =========================
    if (color) {
      filter.colors = color;
    }

    // =========================
    // SIZE FILTER
    // =========================
    if (size) {
      filter.size = size;
    }

    const products = await Product.find(filter).sort({
      createdAt: -1,
    });

    return Response.json(
      {
        success: true,
        products,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get products error:", error);

    return Response.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}

// ==========================================
// CREATE PRODUCT
// ==========================================
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
    console.error("Create product error:", error);

    return Response.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}

// ==========================================
// UPDATE PRODUCT
// ==========================================
export async function PUT(req) {
  try {
    await connectDB();

    const body = await req.json();

    const { id, ...updateData } = body;

    if (!id) {
      return Response.json(
        {
          success: false,
          message: "Product ID is required",
        },
        { status: 400 }
      );
    }

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
    console.error("Update product error:", error);

    return Response.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}

// ==========================================
// DELETE PRODUCT
// ==========================================
export async function DELETE(req) {
  try {
    await connectDB();

    const body = await req.json();

    const { id } = body;

    if (!id) {
      return Response.json(
        {
          success: false,
          message: "Product ID is required",
        },
        { status: 400 }
      );
    }

    const product = await Product.findByIdAndDelete(id);

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
    console.error("Delete product error:", error);

    return Response.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}