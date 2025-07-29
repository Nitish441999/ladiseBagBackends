import { asyncHandler } from "../utils/asyncHandler.js";
import Cart from "../models/cart.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";

const addToCart = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { cartProduct, quantity } = req.body;

  
  if (!cartProduct || typeof quantity !== 'number' || quantity <= 0) {
    throw new ApiError(400, "cartProduct ID and valid quantity are required");
  }


  let cart = await Cart.findOne({ userId });

  if (!cart) {
   
    cart = await Cart.create({
      userId,
      items: [{ cartProduct, quantity }],
    });
  } else {
  
    const itemIndex = cart.items.findIndex(
      (item) => item.cartProduct.toString() === cartProduct
    );

    if (itemIndex > -1) {
      
      cart.items[itemIndex].quantity += quantity;
    } else {
      
      cart.items.push({ cartProduct, quantity });
    }

    await cart.save();
  }

 
  const updatedCart = await Cart.findById(cart._id).populate({
    path: "items.cartProduct",
    model: "Product",
  });

  return res.status(200).json(
    new ApiResponse(200, updatedCart, "Item added to cart successfully")
  );
});


const getCart = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  

  const cart = await Cart.findOne({ userId }).populate("items.cartProduct")

  res.status(200).json(new ApiResponse(200, cart, "Cart fetched successfully"));
});

const deleteCart = asyncHandler(async (req, res) => {
  const { id } = req.params; 
  const userId = req.user._id;

 

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid cart item ID");
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "Invalid user ID");
  }

  
  const updatedCart = await Cart.findOneAndUpdate(
    { userId },
    { $pull: { items: { _id: id } } },
    { new: true }
  );

  if (!updatedCart) {
    throw new ApiError(404, "Cart not found or item not deleted");
  }

  res.status(200).json( new ApiResponse(200, "Cart item removed successfully", updatedCart));
});



export { addToCart, getCart, deleteCart };
