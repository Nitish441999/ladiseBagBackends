import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRouter from "../src/routes/auth.routes.js";
import addressRouter from "../src/routes/address.route.js";
import cartRouter from "../src/routes/cart.routes.js";
import orderRouter from "../src/routes/order.route.js";
import productRouter from "../src/routes/product.routes.js";

dotenv.config();

const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(express.static("public")); // lowercase folder
app.use(cookieParser());

// Routes
app.get("/", (req, res) => {
  res.send("Server started via GET request");
});

app.use("/api/users", userRouter);
app.use("/api/address", addressRouter);
app.use("/api/cart", cartRouter);
app.use("/api/orders", orderRouter);
app.use("/api/products", productRouter);

// 404 handler
app.use("/", (req, res) => {
  res.status(404).json({ success: false, message: "API endpoint not found" });
});

export { app };
