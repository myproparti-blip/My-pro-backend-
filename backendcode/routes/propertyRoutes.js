import express from "express";
import {
  createProperty,
  getAllProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
  approveProperty,
} from "../controllers/propertylisController.js";
import upload from "../middleware/upload.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

const uploadFields = upload.fields([
  { name: "images", maxCount: 10 },
  { name: "videos", maxCount: 5 },
]);

router.post("/", protect, uploadFields, createProperty);
router.get("/", protect, getAllProperties);
router.get("/:id",getPropertyById);
router.put("/:id",uploadFields, updateProperty);
router.delete("/:id", deleteProperty);
router.post("/:id/approve", approveProperty);

export default router;
