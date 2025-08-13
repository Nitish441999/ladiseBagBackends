import Address from "../models/address.model.js";
import Cart from "../models/cart.model.js";
import Order from "../models/order.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";
import moment from "moment/moment.js";

const placeOrder = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { cart, shippingAddress, totalAmount, paymentMethod } = req.body;

  if (!cart || !mongoose.Types.ObjectId.isValid(cart)) {
    throw new ApiError(400, "Valid Cart ID is required");
  }

  if (!totalAmount || isNaN(totalAmount) || totalAmount <= 0) {
    throw new ApiError(400, "Total amount is invalid");
  }

  if (!paymentMethod || typeof paymentMethod !== "string") {
    throw new ApiError(400, "Payment method is required");
  }

  
  const addressDoc = await Address.findById(shippingAddress);
  if (!addressDoc) {
    throw new ApiError(404, "Shipping address not found");
  }

  const shippingAddres = {
    fullName: addressDoc.fullName,
    phone: addressDoc.phone,
    address: addressDoc.address,
    city: addressDoc.city,
    state: addressDoc.state,
    zipCode: addressDoc.zipCode,
    addressType: addressDoc.addressType,
  };

 
  const userCart = await Cart.findById(cart).populate("items.cartProduct");

  if (!userCart || userCart.items.length === 0) {
    throw new ApiError(404, "Cart not found or empty");
  }




  const cartItems = userCart.items.map((item) => {
    const product = item.cartProduct;

    if (!product) return null; 

    return {
      cartProduct: product._id,
      name: product.name,
      price: product.price,
      quantity: item.quantity,
      color: product.color || "",
      material: product.material || "",
      gallery: product.gallery?.[0] || "",
      category: product.category || "",
    };
  }).filter(Boolean); // Remove nulls

  if (cartItems.length === 0) {
    throw new ApiError(400, "No valid products found in cart");
  }

 
  const order = new Order({
    userId,
    cart,
    cartItems,
    shippingAddress: shippingAddres,
    totalAmount,
    paymentMethod,
    status: "Processing",
  });

  const savedOrder = await order.save();


  await Cart.findByIdAndUpdate(cart, { items: [] });


  res
    .status(201)
    .json(new ApiResponse(201, savedOrder, "Order placed successfully"));
});


const getOrderById = asyncHandler(async (req, res) => {
  const { id } = req.params;


  const order = await Order.findById(id).populate("userId CartID");

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, order, "Order fetched successfully"));
});

const getAllOrders = asyncHandler(async (req, res) => {
  const userId = req.user._id
 const orders = await Order.find({userId})
  .populate({
    path: "cart",
    populate: {
      path: "items.cartProduct",
      model: "Product",
    },
  })
  .populate("userId", "userName email")
  .populate("shippingAddress");

  
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

const TAX_RATE = 0.08; // 8%

const cancelOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { cartProduct } = req.body; 

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid Order ID");
  }

  const order = await Order.findById(id);
  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  if (!["Pending", "Processing"].includes(order.status)) {
    throw new ApiError(400, "This order can't be modified now.");
  }

  if (order.cartItems.length === 1) {
    const item = order.cartItems[0];

    if (item.status === 'Cancelled') {
      throw new ApiError(400, "Item is already cancelled");
    }

    item.status = 'Cancelled';
    item.cancelled = true;
    order.status = 'Cancelled';

    // Deduct both price and tax
    const cancelAmount = item.price * item.quantity;
    const cancelTax = cancelAmount * TAX_RATE;
    order.totalAmount = Math.max(0, order.totalAmount - cancelAmount - cancelTax);

  } else {
    let deductedAmount = 0;
    let deductedTax = 0;
    let itemsModified = false;

    order.cartItems = order.cartItems.map((item) => {
      if (
        cartProduct.includes(item._id.toString()) &&
        item.status !== 'Cancelled'
      ) {
        item.status = 'Cancelled';
        item.cancelled = true; 
        deductedAmount += item.price * item.quantity;
        deductedTax += (item.price * item.quantity) * TAX_RATE;
        itemsModified = true;
      }
      return item;
    });

    if (!itemsModified) {
      throw new ApiError(400, "No valid items selected or already cancelled");
    }

    // Deduct both subtotal and tax
    order.totalAmount = Math.max(0, order.totalAmount - deductedAmount - deductedTax);
  }

  const allItemsCancelled = order.cartItems.every(
    (item) => item.status === 'Cancelled'
  );
  if (allItemsCancelled) {
    order.status = 'Cancelled';
  }

  const updatedOrder = await order.save();

  res.status(200).json(
    new ApiResponse(200, updatedOrder, "Selected items cancelled successfully")
  );
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

const getWeeklyRevenue = asyncHandler(async (req, res) => {
  const startOfWeek = moment().startOf("week");
  const endOfWeek = moment().endOf("week");
  const orders = await Order.find({
    createdAt: { $gte: startOfWeek.toDate(), $lte: endOfWeek.toDate() },
  });
  const weeklyData = {};
  orders.forEach((order) => {
    const day = moment(order.createdAt).format("ddd"); // 'Mon', 'Tue', etc.
    if (!weeklyData[day]) {
      weeklyData[day] = { revenue: 0, orders: 0 };
    }
    weeklyData[day].revenue += order.totalAmount;
    weeklyData[day].orders += 1;
  });
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const formattedData = days.map((day) => ({
    name: day,
    revenue: weeklyData[day]?.revenue || 0,
    orders: weeklyData[day]?.orders || 0,
  }));
  res
    .status(200)
    .json(
      new ApiResponse(200, formattedData, "Weekly Data Fetched successfully")
    );
});



export {
  placeOrder,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
  cancelOrder,
  returnOrder,
  getWeeklyRevenue,
};
