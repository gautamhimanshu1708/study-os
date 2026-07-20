import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import plannerRoutes from './routes/plannerRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import goalRoutes from './routes/goalRoutes.js';
import consistencyRoutes from './routes/consistencyRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import studySessionRoutes from './routes/studySessionRoutes.js';
import deadlineRoutes from './routes/deadlineRoutes.js';

// Load env vars — resolve path relative to this file so it works from any CWD
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

// Connect to MongoDB
connectDB();

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────

const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((url) => url.trim())
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// ── Routes ────────────────────────────────────────────────────────────────────

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'StudyOS Backend API is active',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/planner', plannerRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/consistency', consistencyRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/study-sessions', studySessionRoutes);
app.use('/api/deadlines', deadlineRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'StudyOS API is running', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ── Start Server ──────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`StudyOS server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
