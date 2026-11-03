const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/inventory_db';

let isConnected = false;

/**
 * Connect to MongoDB using Mongoose with robust lifecycle handling
 */
const connectDB = async () => {
  if (isConnected) {
    return mongoose.connection;
  }

  try {
    const conn = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      autoIndex: true
    });

    isConnected = true;
    console.log(`✓ MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn.connection;
  } catch (error) {
    console.warn(`⚠️ Warning: MongoDB connection failed (${error.message}).`);
    console.warn(`💡 Tip: Ensure MongoDB service is running locally at ${MONGODB_URI} or provide MONGODB_URI in backend/.env`);
    return null;
  }
};

// Connection event listeners
mongoose.connection.on('connected', () => {
  isConnected = true;
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB Connection Error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  isConnected = false;
  console.log('ℹ️ MongoDB Disconnected');
});

/**
 * Health check test connection helper
 */
const testConnection = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      return true;
    }
    const conn = await connectDB();
    return conn !== null;
  } catch (err) {
    return false;
  }
};

module.exports = {
  connectDB,
  testConnection,
  mongoose
};
