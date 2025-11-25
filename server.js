// server.js (Vercel Compatible)

import dotenv from "dotenv";
dotenv.config({ path: ".env" });

import express from "express";
import cors from "cors";
import path from "path";
import os from "os";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";
import { errorHandler } from "./middleware/errorMiddleware.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import consultantRoutes from "./routes/consultantRoutes.js";
import propertyRoutes from "./routes/propertyRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import agentRoutes from "./routes/agentRoutes.js";
import advertisementRoutes from "./routes/advertisementRoutes.js";
import locationRoutes from "./routes/locationRoutes.js";

const app = express();

// Needed for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Local IP (for logs only)
function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }
  return "localhost";
}
const localIp = getLocalIp();

// ===== Middleware =====
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ❌ REMOVE — it breaks Vercel
// app.options("*", cors());

// ===== Connect MongoDB (run only once on cold start) =====
let dbConnected = false;

async function ensureDB() {
  if (!dbConnected) {
    await connectDB();
    dbConnected = true;
    console.log("✅ MongoDB connected (Vercel cold start)");
  }
}

// ===== Routes =====
app.use("/api/auth", authRoutes);
app.use("/api/consultants", consultantRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/agents", agentRoutes);
app.use("/api/advertisements", advertisementRoutes);
app.use("/api/locations", locationRoutes);

app.get("/api", async (req, res) => {
  await ensureDB();
  res.json({
    success: true,
    message: "Backend API running successfully ✅",
    serverTime: new Date(),
  });
});

// Error Handler
app.use(errorHandler);

// =============================================
// ⭐ EXPORT EXPRESS APP AS VERCEL HANDLER
// =============================================
export default async function handler(req, res) {
  await ensureDB();
  return app(req, res);
}

export const config = {
  api: {
    bodyParser: false, // Allow Express to handle body parsing
  },
};
