import dotenv from "dotenv";
dotenv.config();
import jwt from "jsonwebtoken";
import axios from "axios";
import User from "../models/userModel.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { MESSAGES } from "../utils/messages.js";
import ApiError from "../utils/apiError.js";

const FAST2SMS_API_KEY = process.env.FAST2SMS_API_KEY;
const ENABLE_SMS = process.env.ENABLE_SMS === "true";
const FAST2SMS_SENDER_ID = process.env.FAST2SMS_SENDER_ID || "MYPROPT";
const ADMIN_PHONE = String(process.env.ADMIN_PHONE).trim();

const otpStore = new Map();

const generateOtp = () => Math.floor(1000 + Math.random() * 9000).toString();

const validateIndianPhone = (phone) => /^[6-9]\d{9}$/.test(phone);

const formatPhoneForFast2SMS = (phone) => {
  let cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("91") && cleaned.length === 12) cleaned = cleaned.substring(2);
  if (cleaned.length === 10) return cleaned;
  throw new ApiError(MESSAGES.AUTH.INVALID_PHONE, 400);
};

setInterval(() => {
  const now = Date.now();
  for (const [phone, data] of otpStore.entries()) {
    if (data.expiresAt < now) otpStore.delete(phone);
  }
}, 60000);

const sendRealTimeSMS = async (phone, otpCode) => {
  otpStore.set(phone, {
    code: otpCode,
    expiresAt: Date.now() + 10 * 60 * 1000,
    createdAt: Date.now(),
  });

  console.log(`✅ OTP for ${phone}: ${otpCode}`);

  if (!ENABLE_SMS) {
    console.log("⚠️ SMS sending disabled (ENABLE_SMS=false)");
    return { success: true };
  }

  const payload = {
    sender_id: FAST2SMS_SENDER_ID,
    message: `Your OTP is ${otpCode}. Valid for 10 minutes.`,
    language: "english",
    route: "otp",
    numbers: formatPhoneForFast2SMS(phone),
  };

  try {
    const response = await axios.post("https://www.fast2sms.com/dev/bulkV2", payload, {
      headers: {
        authorization: FAST2SMS_API_KEY,
        "Content-Type": "application/json",
      },
      timeout: 10000,
    });

    if (!response.data.return) {
      console.error("❌ SMS API error:", response.data);
      throw new ApiError(MESSAGES.AUTH.OTP_FAILED, 500);
    }

    console.log("📩 OTP sent successfully via Fast2SMS");
    return { success: true };
  } catch (error) {
    console.error("🚨 SMS sending failed:", error.message);
    throw new ApiError(MESSAGES.AUTH.OTP_FAILED, 500);
  }
};

const generateAccessToken = (user) =>
  jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "2d" });

export const sendOtp = asyncHandler(async (req, res) => {
  const { phone, role } = req.body;

  if (!phone) throw new ApiError(MESSAGES.AUTH.PHONE_ROLE_REQUIRED, 400);
  if (!validateIndianPhone(phone)) throw new ApiError(MESSAGES.AUTH.INVALID_PHONE, 400);
  if (phone !== ADMIN_PHONE && !role)
    throw new ApiError(MESSAGES.AUTH.PHONE_ROLE_REQUIRED, 400);

  const existing = otpStore.get(phone);
  if (existing && Date.now() - existing.createdAt < 30000) {
    throw new ApiError("Please wait 30 seconds before requesting another OTP", 429);
  }

  const otp = generateOtp();
  await sendRealTimeSMS(phone, otp);

  res.status(200).json({
    success: true,
    message: MESSAGES.AUTH.OTP_SENT,
    debugOtp: process.env.NODE_ENV !== "production" ? otp : undefined,
  });
});

export const resendOtp = asyncHandler(async (req, res) => {
  const { phone } = req.body;
  if (!phone) throw new ApiError(MESSAGES.AUTH.PHONE_ROLE_REQUIRED, 400);

  const otp = generateOtp();
  await sendRealTimeSMS(phone, otp);

  res.status(200).json({
    success: true,
    message: MESSAGES.AUTH.OTP_RESENT,
    debugOtp: process.env.NODE_ENV !== "production" ? otp : undefined,
  });
});

// export const verifyOtp = asyncHandler(async (req, res) => {
//   const { phone, otp, role } = req.body;
//   if (!phone || !otp) throw new ApiError(MESSAGES.AUTH.OTP_INVALID, 400);

//   const otpData = otpStore.get(phone);
//   if (!otpData) throw new ApiError(MESSAGES.AUTH.OTP_EXPIRED, 400);
//   if (otpData.code !== otp) throw new ApiError(MESSAGES.AUTH.OTP_INCORRECT, 400);

//   let user;
//   const isAdmin = phone === ADMIN_PHONE;

//   if (isAdmin) {
//     user = (await User.findOne({ phone })) || (await User.create({ phone, role: ["admin"] }));
//     if (!user.role.includes("admin")) {
//       user.role = ["admin"];
//       await user.save();
//     }

//     const allUsers = await User.find({}).select("-__v");
//     otpStore.delete(phone);

//     const accessToken = generateAccessToken(user);
//     return res.status(200).json({
//       success: true,
//       message: MESSAGES.AUTH.ADMIN_LOGIN_SUCCESS,
//       user,
//       accessToken,
//       allUsers,
//     });
//   }

//   if (!role) throw new ApiError(MESSAGES.AUTH.PHONE_ROLE_REQUIRED, 400);

//   user = await User.findOne({ phone });
//   if (!user) {
//     user = await User.create({ phone, role: [role] });
//   } else if (!user.role.includes(role)) {
//     user.role.push(role);
//     await user.save();
//   }

//   otpStore.delete(phone);
//   const accessToken = generateAccessToken(user);

//   res.status(200).json({
//     success: true,
//     message: MESSAGES.AUTH.LOGIN_SUCCESS,
//     user,
//     accessToken,
//   });
// });


export const verifyOtp = asyncHandler(async (req, res) => {
  const { phone, otp, role } = req.body;
  if (!phone || !otp) throw new ApiError(MESSAGES.AUTH.OTP_INVALID, 400);

  // ✅ DUMMY OTP VALIDATION - Added for testing purposes
  const isDummyOtp = otp === "1234";
  
  const otpData = otpStore.get(phone);
  
  // Check if OTP is valid (either dummy OTP or actual stored OTP)
  if (!isDummyOtp) {
    // Existing OTP validation logic
    if (!otpData) throw new ApiError(MESSAGES.AUTH.OTP_EXPIRED, 400);
    if (otpData.code !== otp) throw new ApiError(MESSAGES.AUTH.OTP_INCORRECT, 400);
  }

  let user;
  const isAdmin = phone === ADMIN_PHONE;

  if (isAdmin) {
    user = (await User.findOne({ phone })) || (await User.create({ phone, role: ["admin"] }));
    if (!user.role.includes("admin")) {
      user.role = ["admin"];
      await user.save();
    }

    const allUsers = await User.find({}).select("-__v");
    
    // Only delete from store if it was a real OTP (not dummy)
    if (!isDummyOtp) {
      otpStore.delete(phone);
    }

    const accessToken = generateAccessToken(user);
    return res.status(200).json({
      success: true,
      message: MESSAGES.AUTH.ADMIN_LOGIN_SUCCESS,
      user,
      accessToken,
      allUsers,
    });
  }

  if (!role) throw new ApiError(MESSAGES.AUTH.PHONE_ROLE_REQUIRED, 400);

  user = await User.findOne({ phone });
  if (!user) {
    user = await User.create({ phone, role: [role] });
  } else if (!user.role.includes(role)) {
    user.role.push(role);
    await user.save();
  }

  // Only delete from store if it was a real OTP (not dummy)
  if (!isDummyOtp) {
    otpStore.delete(phone);
  }
  
  const accessToken = generateAccessToken(user);

  res.status(200).json({
    success: true,
    message: MESSAGES.AUTH.LOGIN_SUCCESS,
    user,
    accessToken,
  });
});

export const profile = asyncHandler(async (req, res) => {
  const isAdmin = req.user.phone === ADMIN_PHONE;

  if (isAdmin) {
    const users = await User.find({}).select("-__v");
    return res.status(200).json({ success: true, users });
  }

  const user = await User.findById(req.user._id).select("-__v");
  if (!user) throw new ApiError(MESSAGES.AUTH.USER_NOT_FOUND, 404);

  res.status(200).json({ success: true, user });
});

export const deleteAccount = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const targetUser = await User.findById(id);
  if (!targetUser) throw new ApiError(MESSAGES.AUTH.USER_NOT_FOUND, 404);

  const isAdmin = req.user.phone === ADMIN_PHONE;
  const isOwner = targetUser._id.equals(req.user._id);

  if (!isAdmin && !isOwner)
    throw new ApiError(MESSAGES.AUTH.NOT_AUTHORIZED, 403);

  await targetUser.deleteOne();
  res.status(200).json({
    success: true,
    message: MESSAGES.AUTH.ACCOUNT_DELETED,
  });
});
