import asyncHandler from "express-async-handler";
import Wishlist from "../models/wishlist.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import mongoose from "mongoose";

const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  const userId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new ApiError(400, "Invalid Product ID");
  }

  let wishlist = await Wishlist.findOne({ userId });

  if (!wishlist) {
    wishlist = await Wishlist.create({ userId, products: [productId] });
  } else {
    if (wishlist.products.includes(productId)) {
      throw new ApiError(400, "Product already in wishlist");
    }
    wishlist.products.push(productId);
    await wishlist.save();
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Product added to wishlist", wishlist));
});

const getWishlist = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const wishlist = await Wishlist.findOne({ userId }).populate("products");

  return res.status(200).json(
    new ApiResponse(200, "Wishlist fetched successfully", {
      products: wishlist?.products || [],
    })
  );
});

const removeFromWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const userId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new ApiError(400, "Invalid Product ID");
  }

  const wishlist = await Wishlist.findOne({ userId });

  if (!wishlist) {
    throw new ApiError(404, "Wishlist not found");
  }

  wishlist.products = wishlist.products.filter(
    (id) => id.toString() !== productId
  );
  await wishlist.save();

  return res
    .status(200)
    .json(new ApiResponse(200, "Product removed from wishlist"));
});
export { addToWishlist, getWishlist, removeFromWishlist };
