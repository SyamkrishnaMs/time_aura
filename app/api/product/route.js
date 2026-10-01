import connectDB from "../../lib/mongodb";
import Product from "../../models/product.Schema.js";

// ==========================================
// GET ALL PRODUCTS
// ==========================================

export async function GET() {
  try {
    await connectDB();

    const products = await Product.find().sort({ createdAt: -1 });

    return Response.json(
      {
        success: true,
        products,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET PRODUCTS ERROR:", error);

    return Response.json(
      {
        success: false,
        message: error.message || "Failed to fetch products",
      },
      { status: 500 }
    );
  }
}
