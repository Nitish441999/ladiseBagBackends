import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Address from "../models/address.model.js";

const createAddress = asyncHandler(async (req, res) => {
  const { firstName, lastName, address, city, state, zipCode } = req.body;
  console.log(req.body);
  const userId = req.user._id;

  if (!firstName || !lastName || !address || !city || !state || !zipCode) {
    throw new ApiError(400, "All fields are required");
  }

  const newAddress = await Address.create({
    userId,
    firstName,
    lastName,
    address,
    city,
    state,
    zipCode,
  });

  res
    .status(201)
    .json(new ApiResponse(201, "Address added successfully", newAddress));
});

const getAllAddresses = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const addresses = await Address.find({ userId });
  if (!addresses || addresses.length === 0) {
    throw new ApiError(404, "No addresses found for this user");
  }
  res
    .status(200)
    .json(new ApiResponse(200, "Addresses fetched successfully", addresses));
});
const deleteAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params;

  if (!addressId) {
    throw new ApiError(400, "Address ID is required");
  }

  const deleted = await Address.findByIdAndDelete(addressId);

  if (!deleted) {
    throw new ApiError(404, "Address not found");
  }

  res
    .status(200)
    .json(ApiResponse(200, "Address deleted successfully", deleted));
});

const updateAddress = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, address, city, state, zipCode } = req.body;

  if (!id) {
    throw new ApiError(400, "Address ID is required");
  }

  const updatedAddress = await Address.findByIdAndUpdate(
    id,
    {
      firstName,
      lastName,
      address,
      city,
      state,
      zipCode,
    },
    { new: true, runValidators: true }
  );

  if (!updatedAddress) {
    throw new ApiError(404, "Address not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, "Address updated successfully", updatedAddress));
});

export { createAddress, getAllAddresses, deleteAddress, updateAddress };
