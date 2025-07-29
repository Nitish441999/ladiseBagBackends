import Product from "../models/product.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";
import Review from "../models/review.model.js";

const createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    price,
    description,
    stock,
    material,
    category,
    color,
    availableColors,
  } = req.body;

  if (!name || !price) {
    throw new ApiError(400, "Title and Price are required");
  }

  const imagesLocalPaths = req.files?.gallery;
  if (!imagesLocalPaths || imagesLocalPaths.length === 0) {
    throw new ApiError(400, "At least one image file is required");
  }

  const gallery = await Promise.all(
    imagesLocalPaths.map(async (file) => {
      const uploadedImage = await uploadOnCloudinary(file.path);
      return uploadedImage?.url;
    })
  );

  const product = new Product({
    name,
    gallery,
    price,
    description,
    stock,
    category,
    color,
    availableColors,
    reviews: [],
    material,
  });

  const savedProduct = await product.save();

  res
    .status(201)
    .json(new ApiResponse(201, savedProduct, "Product created successfully"));
});

const getAllProducts = asyncHandler(async (req, res) => {
  const products = await Product.find().populate("reviews");

  const productsWithRatings = products.map((product) => {
    const totalReviews = product.reviews.length;
    const totalStars = product.reviews.reduce(
      (sum, review) => sum + review.rating,
      0
    );
    const avgRating = totalReviews > 0 ? totalStars / totalReviews : 0;

    return {
      ...product.toObject(),
      averageRating: avgRating.toFixed(1),
      reviewCount: totalReviews,
    };
  });

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        productsWithRatings,
        "Products with ratings fetched successfully"
      )
    );
});

const getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new ApiError(400, "Product ID is required");
  }

  const product = await Product.findById(id);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, product, "Product fetched successfully"));
});

const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  if (!id) {
    throw new ApiError(400, "Product ID is required");
  }

  const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!updatedProduct) {
    throw new ApiError(404, "Product not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, updatedProduct, "Product updated successfully"));
});
const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new ApiError(400, "Product ID is required");
  }

  const deletedProduct = await Product.findByIdAndDelete(id);

  if (!deletedProduct) {
    throw new ApiError(404, "Product not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, deletedProduct, "Product deleted successfully"));
});

export {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
