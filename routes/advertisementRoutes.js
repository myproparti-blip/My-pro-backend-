import express from "express";
import upload from "../middleware/upload.js";
import {
  uploadImage,
  uploadVideo,
  uploadMultiple,
  getAllAdvertisements,
  deleteAdvertisement,
  updateAdvertisementUrl, // Add this import
} from "../controllers/advertisementController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/upload/image", protect, upload.single("image"), uploadImage);
router.post("/upload/video", protect, upload.single("video"), uploadVideo);
router.post("/upload/multiple", protect, upload.array("files", 10), uploadMultiple);
router.get("/", getAllAdvertisements);

// Add this new route for updating URLs
router.patch("/:id/url", protect, updateAdvertisementUrl);

router.delete("/:id", protect, deleteAdvertisement);

export default router;