import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod = null;

const connectDB = async () => {
  try {
    let uri = process.env.MONGO_URI;

    // Check if URI is a placeholder or not provided
    const isPlaceholder = !uri || uri.includes('<username>') || uri.includes('xxxxx');

    if (!isPlaceholder) {
      try {
        const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
        console.log(`✅ MongoDB Connected (Atlas/External): ${conn.connection.host}`);
        return;
      } catch (err) {
        console.warn(`⚠️ External MongoDB connection failed (${err.message}). Falling back to In-Memory MongoDB for local development.`);
      }
    }

    // Fallback to MongoMemoryServer for zero-config local testing
    console.log('⚡ Starting in-memory MongoDB server for local environment...');
    mongod = await MongoMemoryServer.create();
    const mongoUri = mongod.getUri();
    const conn = await mongoose.connect(mongoUri);
    console.log(`✅ In-Memory MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
  }
};

export default connectDB;
