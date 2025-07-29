import mongoose from "mongoose";


const shippingAddressSchema = new mongoose.Schema({
  
  fullName: { type: String, required: true },
  phone: { type: Number, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String, required: true },
  addressType:{type:String, required:true}
});


const orderItemSchema = new mongoose.Schema({
  cartProduct: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product", 
    required: true,
  },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  color: { type: String },
  material: { type: String },
  image: { type: String }, 
  gallery: [String], 
  category:{type:String},
  status:{type:String}      
});


const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    cart: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cart",
      required: true,
    },

    cartItems: {
      type: [orderItemSchema],
    },

    shippingAddress: {
      type: shippingAddressSchema, 
      required: true,
    },

    totalAmount: {
      type: Number,
      required: true,
    },

    paymentMethod: {
      type: String,
      enum: ["COD", "Credit Card", "UPI", "Net Banking"],
      required: true,
    },

    status: {
      type: String,
      enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Processing",
    },
  },
  { timestamps: true }
);


export default mongoose.model("Order", orderSchema);
