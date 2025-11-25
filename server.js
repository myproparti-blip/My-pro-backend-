// server.js
import dotenv from "dotenv";
dotenv.config({ path: '.env' }); // Explicitly specify path

import express from "express";
import cors from "cors";
import path from "path";
import os from "os";
import http from "http";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";
import { errorHandler } from "./middleware/errorMiddleware.js";
import { initWebSocket } from "./utils/websocketServer.js";

// ===== Import Routes =====
import authRoutes from "./routes/authRoutes.js";
import consultantRoutes from "./routes/consultantRoutes.js";
import propertyRoutes from "./routes/propertyRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import agentRoutes from "./routes/agentRoutes.js";
import advertisementRoutes from "./routes/advertisementRoutes.js";
import locationRoutes from "./routes/locationRoutes.js";

const app = express();

// ===== File & Directory Setup =====
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ===== Helper Function: Get Local Network IP =====
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
    credentials: false,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.options("*", cors());

// ===== Database Connection with Error Handling =====
const initializeServer = async () => {
  try {
    console.log("🔄 Initializing database connection...");
    await connectDB();
    console.log("✅ Database connected successfully!");
    
    // ===== Routes =====
    app.use("/api/auth", authRoutes);
    app.use("/api/consultants", consultantRoutes);
    app.use("/api/properties", propertyRoutes);
    app.use("/api/payments", paymentRoutes);
    app.use("/api/agents", agentRoutes);
    app.use("/api/advertisements", advertisementRoutes);
    app.use("/api/locations", locationRoutes);
    
    app.get("/api", (req, res) => {
      res.json({
        success: true,
        message: "Backend API running successfully ✅",
        serverTime: new Date(),
        local: `http://localhost:${PORT}`,
        lan: `http://${localIp}:${PORT}`,
      });
    });

    // ===== Error Handler =====
    app.use(errorHandler);

    // ===== Create HTTP Server & Initialize WebSocket =====
    const PORT = process.env.PORT || 5000;
    const server = http.createServer(app);

    initWebSocket(server);

    server.listen(PORT, "0.0.0.0", () => {
      console.log("===========================================");
      console.log("🚀 Backend Server Started Successfully!");
      console.log(`✅ MongoDB connected successfully`);
      console.log(`✅ Local Access     → http://localhost:${PORT}`);
      console.log(`🌐 Network Access   → http://${localIp}:${PORT}`);
      console.log(`🔌 WebSocket        → ws://${localIp}:${PORT}`);
      console.log("💡 Make sure both devices are on the same Wi-Fi network!");
      console.log("===========================================");
    });

  } catch (error) {
    console.error("💥 Failed to start server:", error.message);
    console.log("🔧 Troubleshooting steps:");
    console.log("1. Check MongoDB connection string in .env file");
    console.log("2. Verify internet connection");
    console.log("3. Check if MongoDB Atlas cluster is running");
    console.log("4. Verify IP is whitelisted in MongoDB Atlas");
    process.exit(1);
  }
};

// Start the server
initializeServer();