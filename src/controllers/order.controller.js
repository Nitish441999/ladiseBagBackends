import Order from "../models/order.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";

const placeOrder = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { cart, shippingAddress, totalAmount, paymentMethod } = req.body;

  console.log("Received request body:", req.body);

  if (!cart || cart.trim() === "") {
    throw new ApiError(400, "Cart ID is required");
  }

  if (!shippingAddress || shippingAddress.trim() === "") {
    throw new ApiError(400, "Shipping address is required");
  }

  if (!totalAmount || isNaN(totalAmount) || totalAmount <= 0) {
    throw new ApiError(
      400,
      "Total amount is required and must be greater than 0"
    );
  }

  if (!paymentMethod || paymentMethod.trim() === "") {
    throw new ApiError(400, "Payment method is required");
  }

  const order = new Order({
    userId,
    cart,
    shippingAddress,
    totalAmount,
    paymentMethod,
    status: "Pending",
  });

  const savedOrder = await order.save();

  res
    .status(201)
    .json(new ApiResponse(201, savedOrder, "Order placed successfully"));
});

const getOrderById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid Order ID");
  }

  const order = await Order.findById(id).populate("userId CartID");

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, order, "Order fetched successfully"));
});

const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find()
    .populate({
      path: "cart",
      populate: {
        path: "items.productId",
        model: "Product",
      },
    })
    .populate("userId", "userName email")
    .populate("shippingAddress");

  if (!orders || orders.length === 0) {
    throw new ApiError(404, "No orders found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, orders, "Orders fetched successfully"));
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid Order ID");
  }

  if (!status) {
    throw new ApiError(400, "Order status is required");
  }

  const updatedOrder = await Order.findByIdAndUpdate(
    id,
    { status },
    { new: true }
  ).populate("userId items.productId");

  if (!updatedOrder) {
    throw new ApiError(404, "Order not found");
  }

  res
    .status(200)
    .json(
      new ApiResponse(200, updatedOrder, "Order status updated successfully")
    );
});

const deleteOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid Order ID");
  }

  const deletedOrder = await Order.findByIdAndDelete(id);

  if (!deletedOrder) {
    throw new ApiError(404, "Order not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, null, "Order deleted successfully"));
});

const cancleOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid Order ID");
  }

  const order = await Order.findById(id);
  if (!order) {
    throw new ApiError(404, "Order not found");
  }
  if (order.status !== "Pending") {
    throw new ApiError(400, "Only pending orders can be cancelled");
  }
  order.status = "Cancelled";
  const updatedOrder = await order.save();
  res
    .status(200)
    .json(new ApiResponse(200, updatedOrder, "Order cancelled successfully"));
});

const returnOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid Order ID");
  }

  const order = await Order.findById(id);
  if (!order) {
    throw new ApiError(404, "Order not found");
  }
  if (order.status !== "Delivered") {
    throw new ApiError(400, "Only delivered orders can be returned");
  }
  order.status = "Returned";
  const updatedOrder = await order.save();
  res
    .status(200)
    .json(new ApiResponse(200, updatedOrder, "Order returned successfully"));
});

export {
  placeOrder,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
  cancleOrder,
  returnOrder,
};
