import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
      brand: {
    type: String,
    required: true,
    trim: true,
  },
 size: 
 { type: [String], enum: ["Small", "Medium", "Large"], 
  required: true, },



    description: {
      type: String,
      required: true,
      trim: true,
    },
gender:{
  type:String,
  required:true,
  enum:["men","women"]
},
    price: {
      type: Number,
      required: true,
      min: 0,
    },

    category: {
      type: String,
      required: true,
      enum: [
        "Luxury",
        "Classic",
        "Sport",
        "Smart",
      ],
    },

    image: {
      type: String,
      required: true,
    },
     color: {
      type: String,
      required: true,
    },
    offerPrice: {
  type: Number,
  required: true,
  min: 0,
},

    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Product =
  mongoose.models.Product ||
  mongoose.model("Product", productSchema);

export default Product;