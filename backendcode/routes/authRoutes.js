import express from "express";
import {
  sendOtp,
  verifyOtp,
  resendOtp,
  profile,
  deleteAccount,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
const router = express.Router();
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);
router.get("/profile", protect, profile);
router.delete("/delete/:id", protect, deleteAccount);
export default router;
