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

// Middleware - Simplified for Vercel
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Database connection state
let dbConnected = false;
let dbConnectionPromise = null;

async function ensureDB() {
  if (!dbConnected) {
    if (!dbConnectionPromise) {
      dbConnectionPromise = connectDB().then(() => {
        dbConnected = true;
        console.log("✅ MongoDB connected on Vercel");
      }).catch(error => {
        console.error("❌ MongoDB connection failed:", error);
        dbConnectionPromise = null;
        throw error;
      });
    }
    await dbConnectionPromise;
  }
}

// Health check (no DB dependency)
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development"
  });
});

// API routes with DB connection
app.use("/api/auth", async (req, res, next) => {
  try {
    await ensureDB();
    next();
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Database connection failed" 
    });
  }
}, authRoutes);

app.use("/api/properties", async (req, res, next) => {
  try {
    await ensureDB();
    next();
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Database connection failed" 
    });
  }
}, propertyRoutes);

// Add similar middleware for other routes...
app.use("/api/consultants", consultantRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/agents", agentRoutes);
app.use("/api/advertisements", advertisementRoutes);
app.use("/api/locations", locationRoutes);

// Root endpoint
app.get("/", (req, res) => {
  res.json({ message: "Backend API is running" });
});

// Root endpoint
app.get("/api", async (req, res) => {
  try {
    await ensureDB();
    res.json({
      success: true,
      message: "Backend API running successfully ✅",
      serverTime: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Database connection unavailable",
      serverTime: new Date().toISOString()
    });
  }
});

// Error handler (must come before 404 handler)
app.use(errorHandler);

// 404 handler - catch all unmatched routes
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Vercel serverless function handler
export default app;