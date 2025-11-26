import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
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

// ------------------------------
// ✅ FIXED CORS FOR VERCEL
// ------------------------------
const allowedOrigins = [
  "https://my-proparti-brw2cvos8-propartis-projects.vercel.app",
  "http://localhost:3000",
];

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

// ------------------------------
// JSON Body Parsing
// ------------------------------
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// ------------------------------
// MongoDB Lazy Connection (Vercel optimized)
// ------------------------------
let dbConnected = false;
let dbConnectionPromise = null;

async function ensureDB() {
  if (!dbConnected) {
    if (!dbConnectionPromise) {
      dbConnectionPromise = connectDB()
        .then(() => {
          dbConnected = true;
          console.log("✅ MongoDB connected");
        })
        .catch((error) => {
          console.error("❌ MongoDB connection failed:", error);
          dbConnectionPromise = null;
          throw error;
        });
    }
    await dbConnectionPromise;
  }
}

// ------------------------------
// Health Check Route
// ------------------------------
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    time: new Date().toISOString(),
  });
});

// ------------------------------
// API Routes (DB required)
// ------------------------------
app.use(
  "/api/auth",
  async (req, res, next) => {
    try {
      await ensureDB();
      next();
    } catch {
      res.status(500).json({ success: false, message: "Database connection failed" });
    }
  },
  authRoutes
);

app.use(
  "/api/properties",
  async (req, res, next) => {
    try {
      await ensureDB();
      next();
    } catch {
      res.status(500).json({ success: false, message: "Database connection failed" });
    }
  },
  propertyRoutes
);

// Other routes (DB optional)
app.use("/api/consultants", consultantRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/agents", agentRoutes);
app.use("/api/advertisements", advertisementRoutes);
app.use("/api/locations", locationRoutes);

// ------------------------------
// Default root
// ------------------------------
app.get("/", (req, res) => {
  res.json({ message: "Backend API is running" });
});

app.get("/api", async (req, res) => {
  try {
    await ensureDB();
    res.json({
      success: true,
      message: "Backend API running successfully",
      time: new Date().toISOString(),
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Database connection failed",
    });
  }
});

// ------------------------------
// Error Handler
// ------------------------------
app.use(errorHandler);

// ------------------------------
// 404 Handler
// ------------------------------
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Export for Vercel serverless
export default app;
