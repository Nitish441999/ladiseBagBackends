import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    avatar: { type: String },
    price: { type: Number, required: true },
    description: String,
    stock: Number,
    category: String,
    color: {
      type: String,
      enum: ["red", "blue", "black", "green", "white", "yellow"],
      default: "black",
    },
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
