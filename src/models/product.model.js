import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: String,
    inStock: { type: Boolean, default: true },
    category: {
      type: String,
      enum: ["Tote", "Shoulder", "Crossbody", "Clutch", "Handbag", "Hobo"],
      default: "Shoulder",
    },
    material: {
      type: String,
      enum: ["cotton", "Leather", "Canvas", "Satin", "Suede"],
      default: "cotton",
    },
    color: {
      type: String,
      enum: [
        "Red",
        "Blue",
        "Black",
        "Green",
        "White",
        "Yellow",
        "Brown",
        "Pink",
        "Gold",
      ],
      default: "black",
    },
    gallery: [String], 
   
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);
export default Product;
