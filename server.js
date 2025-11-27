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
// ✅ UPDATED CORS FOR ALL YOUR DOMAINS
// ------------------------------
const allowedOrigins = [
  // ✅ Your actual frontend domains
  "https://my-proparti.vercel.app",
  "https://my-proparti-git-main-propartis-projects.vercel.app",
  
  // ✅ Your old domains (for backward compatibility)
  "https://my-proparti-brw2cvos8-propartis-projects.vercel.app",
  
  // ✅ Local development
  "http://localhost:3000",
  "http://localhost:3001",
  
  // ✅ LAN access
  "http://192.168.29.78:3000",
  "http://192.168.29.78:3001",
  
  // ✅ React Native apps (Expo Go, development builds)
  "exp://192.168.29.78:8081",
  "exp://localhost:8081",
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  console.log("🌐 CORS Request Origin:", origin);
  console.log("📨 Request Method:", req.method);
  console.log("🔗 Request Path:", req.path);

  // Allow requests with no origin (like mobile apps, Postman)
  if (!origin) {
    return next();
  }

  // Check if origin is allowed
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    console.log("✅ CORS Allowed for origin:", origin);
  } else {
    console.log("❌ CORS Blocked for origin:", origin);
  }

  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Max-Age", "86400"); // 24 hours

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    console.log("🛬 Handling OPTIONS preflight request");
    return res.status(200).end();
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
// Enhanced Health Check Route
// ------------------------------
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    time: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    allowedOrigins: allowedOrigins
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
// Enhanced root endpoints
// ------------------------------
app.get("/", (req, res) => {
  res.json({ 
    message: "Backend API is running",
    version: "1.0.0",
    status: "active",
    timestamp: new Date().toISOString()
  });
});

app.get("/api", async (req, res) => {
  try {
    await ensureDB();
    res.json({
      success: true,
      message: "Backend API running successfully",
      time: new Date().toISOString(),
      database: "connected",
      environment: process.env.NODE_ENV || "development"
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Database connection failed",
      database: "disconnected"
    });
  }
});

// ------------------------------
// Test endpoint for CORS debugging
// ------------------------------
app.get("/api/test-cors", (req, res) => {
  res.json({
    success: true,
    message: "CORS test successful",
    origin: req.headers.origin,
    timestamp: new Date().toISOString()
  });
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
    availableEndpoints: [
      "/api/health",
      "/api/test-cors", 
      "/api/auth",
      "/api/properties",
      "/api/consultants"
    ]
  });
});

// ------------------------------
// Global error handler
// ------------------------------
app.use((error, req, res, next) => {
  console.error("🚨 Global Error Handler:", error);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    ...(process.env.NODE_ENV === 'development' && { error: error.message })
  });
});

// Export for Vercel serverless
export default app;