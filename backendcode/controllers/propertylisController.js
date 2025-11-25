import Property from "../models/propertyModel.js";
import ApiError from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { MESSAGES } from "../utils/messages.js";
import { v2 as cloudinary } from "cloudinary";

// ☁️ Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 🔐 Check if master admin
const isMasterAdmin = (req) => req.user?.phone === process.env.ADMIN_PHONE;

// 🌐 Get base URL (fallback for non-Cloudinary URLs)
const getBaseUrl = (req) => {
  const protocol = req.headers["x-forwarded-proto"] || req.protocol;
  const host = req.get("host");
  return `${protocol}://${host}`;
};

// 🏠 CREATE PROPERTY
export const createProperty = asyncHandler(async (req, res) => {
  const { title, propertyType, addressLine1, city, price, bedrooms } = req.body;

  if (!title || !addressLine1 || !city || !propertyType || !price || !bedrooms) {
    throw new ApiError(MESSAGES.PROPERTY.REQUIRED_FIELDS, 400);
  }

  // ✅ Use Cloudinary URLs directly from multer-storage-cloudinary
  const uploadedImages = req.files?.images?.map((file) => file.path) || [];
  const uploadedVideos = req.files?.videos?.map((file) => file.path) || [];

  const newProperty = new Property({
    ...req.body,
    user: req.user.id,
    images: uploadedImages,
    videos: uploadedVideos,
    isApproved: false,
  });

  const saved = await newProperty.save();

  res.status(201).json({
    success: true,
    message: MESSAGES.PROPERTY.ADD_SUCCESS,
    data: saved,
  });
});

// 📋 GET ALL PROPERTIES
export const getAllProperties = asyncHandler(async (req, res) => {
  const properties = await Property.find().populate("user", "name email phoneNumber");

  const propertiesWithUrls = properties.map((prop) => ({
    ...prop.toObject(),
    images: prop.images.map((url) =>
      url.startsWith("http") ? url : `${getBaseUrl(req)}${url}`
    ),
    videos: prop.videos.map((url) =>
      url.startsWith("http") ? url : `${getBaseUrl(req)}${url}`
    ),
  }));

  res.status(200).json({
    success: true,
    message: MESSAGES.PROPERTY.FETCH_SUCCESS,
    data: propertiesWithUrls,
  });
});

// 🔍 GET PROPERTY BY ID
export const getPropertyById = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id).populate("user", "name email phoneNumber");
  if (!property) throw new ApiError(MESSAGES.PROPERTY.NOT_FOUND, 404);

  const baseUrl = getBaseUrl(req);
  const propertyWithUrls = {
    ...property.toObject(),
    images: property.images.map((url) =>
      url.startsWith("http") ? url : `${baseUrl}${url}`
    ),
    videos: property.videos.map((url) =>
      url.startsWith("http") ? url : `${baseUrl}${url}`
    ),
  };

  res.status(200).json({
    success: true,
    message: MESSAGES.PROPERTY.FETCH_SINGLE_SUCCESS,
    data: propertyWithUrls,
  });
});

// ✏️ UPDATE PROPERTY
export const updateProperty = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);
  if (!property) throw new ApiError(MESSAGES.PROPERTY.NOT_FOUND, 404);

  const isAdmin = isMasterAdmin(req);
  if (property.user.toString() !== req.user.id && !isAdmin) {
    throw new ApiError(MESSAGES.PROPERTY.NOT_AUTHORIZED, 403);
  }

  // ✅ Use new Cloudinary URLs directly
  const newImages = req.files?.images?.map((file) => file.path) || [];
  const newVideos = req.files?.videos?.map((file) => file.path) || [];

  property.images.push(...newImages);
  property.videos.push(...newVideos);
  Object.assign(property, req.body, { lastUpdated: Date.now() });

  const updated = await property.save();

  res.status(200).json({
    success: true,
    message: MESSAGES.PROPERTY.UPDATE_SUCCESS,
    data: updated,
  });
});

// 🗑 DELETE PROPERTY
export const deleteProperty = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);
  if (!property) throw new ApiError(MESSAGES.PROPERTY.NOT_FOUND, 404);

  const isAdmin = isMasterAdmin(req);
  if (property.user.toString() !== req.user.id && !isAdmin)
    throw new ApiError(MESSAGES.PROPERTY.NOT_AUTHORIZED, 403);

  await property.deleteOne();

  res.status(200).json({
    success: true,
    message: MESSAGES.PROPERTY.DELETE_SUCCESS,
  });
});

// ✅ APPROVE PROPERTY
export const approveProperty = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);
  if (!property) throw new ApiError(MESSAGES.PROPERTY.NOT_FOUND, 404);

  const isAdmin = isMasterAdmin(req);
  if (!isAdmin) throw new ApiError(MESSAGES.PROPERTY.NOT_AUTHORIZED, 403);

  property.isApproved = true;
  property.approvedBy = req.user.id;
  property.approvalDate = Date.now();

  const updated = await property.save();

  res.status(200).json({
    success: true,
    message: MESSAGES.PROPERTY.APPROVE_SUCCESS,
    data: updated,
  });
});
