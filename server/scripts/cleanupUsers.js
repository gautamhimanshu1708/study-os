/**
 * Cleanup Script — Deletes ALL users and their associated data from MongoDB.
 * Run this once, then re-register with a fresh account.
 *
 * Usage:  node server/scripts/cleanupUsers.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI || MONGO_URI.includes('<username>') || MONGO_URI.includes('xxxxx')) {
  console.error('❌ No valid MONGO_URI found in .env');
  process.exit(1);
}

async function cleanup() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB Atlas');

    const db = mongoose.connection.db;

    // List of collections to wipe
    const collections = ['users', 'studysessions', 'courses', 'tasks', 'goals', 'consistencylogs', 'deadlines'];

    for (const name of collections) {
      try {
        const result = await db.collection(name).deleteMany({});
        console.log(`🗑️  Deleted ${result.deletedCount} documents from "${name}"`);
      } catch (err) {
        // Collection may not exist — that's fine
        console.log(`⏭️  Skipped "${name}" (may not exist)`);
      }
    }

    console.log('\n✅ Cleanup complete! You can now register a fresh account.');
  } catch (err) {
    console.error('❌ Cleanup failed:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

cleanup();
