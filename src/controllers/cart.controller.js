import { asyncHandler } from "../utils/asyncHandler.js";
import Cart from "../models/cart.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";

const addToCart = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { productId, quantity } = req.body;

  if (!productId || !quantity || quantity <= 0) {
    throw new ApiError(400, "Product ID and valid quantity are required");
  }

  let cart = await Cart.findOne({ userId });

  if (!cart) {
    cart = await Cart.create({
      userId,
      items: [{ productId, quantity }],
    });
  } else {
    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({ productId, quantity });
    }

    await cart.save();
  }

  const updatedCart = await Cart.findById(cart._id).populate({
    path: "items.productId",
    model: "Product",
  });

  res
    .status(200)
    .json(new ApiResponse(200, updatedCart, "Item added to cart successfully"));
});

const getCart = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const cart = await Cart.findOne({ userId }).populate({
    path: "items.productId",
    model: "Product",
  });

  if (!cart) {
    throw new ApiError(404, "Cart not found");
  }

  res.status(200).json(new ApiResponse(200, cart, "Cart fetched successfully"));
});

const deleteCart = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new ApiError(400, "Object ID is invalid");
  }

  const cartDelete = await Cart.findByIdAndDelete(productId);

  if (!cartDelete) {
    throw new ApiError(404, "Cart item not found");
  }

  res
    .status(200)
    .json(ApiResponse(200, "Cart item deleted successfully", cartDelete));
});

export { addToCart, getCart, deleteCart };
