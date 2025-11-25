// config/db.js
import mongoose from "mongoose";
import { MESSAGES } from "../utils/messages.js";

let isConnected = false;
let connectionAttempts = 0;
const MAX_RETRIES = 3;

const connectDB = async () => {
  if (isConnected) {
    console.log("✅ Using existing MongoDB connection");
    return;
  }

  // Prevent multiple connection attempts
  if (mongoose.connection.readyState === 1) {
    isConnected = true;
    return;
  }

  try {
    console.log("🔄 Attempting MongoDB connection...");
    
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      dbName: "playstoreApp",
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000, // 5 seconds timeout
      socketTimeoutMS: 45000, // 45 seconds socket timeout
      retryWrites: true,
      w: "majority"
    });

    isConnected = conn.connections[0].readyState === 1;
    connectionAttempts = 0;
    
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    
  } catch (error) {
    connectionAttempts++;
    
    console.error(`❌ MongoDB connection attempt ${connectionAttempts} failed:`);
    console.error(`Error: ${error.message}`);
    
    if (connectionAttempts < MAX_RETRIES) {
      console.log(`🔄 Retrying connection in 3 seconds... (${connectionAttempts}/${MAX_RETRIES})`);
      setTimeout(connectDB, 3000);
    } else {
      console.error("💥 Maximum connection attempts reached. Please check:");
      console.error("1. MongoDB Atlas whitelisted IP addresses");
      console.error("2. Database user credentials");
      console.error("3. Network connectivity");
      console.error("4. MongoDB cluster status");
      throw new Error("Database connection failed after multiple attempts");
    }
  }
};

// MongoDB connection event handlers
mongoose.connection.on('connected', () => {
  console.log('✅ Mongoose connected to DB');
  isConnected = true;
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error:', err);
  isConnected = false;
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ Mongoose disconnected');
  isConnected = false;
});

// Handle app termination
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('❌ MongoDB connection closed due to app termination');
  process.exit(0);
});

export default connectDB;