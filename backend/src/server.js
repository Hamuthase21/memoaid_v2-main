import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import notesRoutes from './routes/notes.js';
import remindersRoutes from './routes/reminders.js';
import routinesRoutes from './routes/routines.js';
import peopleRoutes from './routes/people.js';
import geminiRoutes from './routes/gemini.js';
import journeyRoutes from './routes/journey.js';
import timelineRoutes from './routes/timeline.js';
import emergencyRoutes from './routes/emergency.js';
import medicationsRoutes from './routes/medications.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../.env');
console.log('📍 Loading .env from:', envPath);
const result = dotenv.config({ path: envPath });
console.log('📍 dotenv.config result:', result.error ? result.error.message : 'success');
console.log('📍 GOOGLE_API_KEY loaded:', process.env.GOOGLE_API_KEY ? '✅ ' + process.env.GOOGLE_API_KEY.substring(0, 10) + '...' : '❌ not found');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Request Logging Middleware
app.use((req, res, next) => {
  console.log(`📝 ${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('   Body:', JSON.stringify(req.body).substring(0, 200) + (JSON.stringify(req.body).length > 200 ? '...' : ''));
  next();
});

// MongoDB Connection (non-blocking)
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/memoaid', {
      connectTimeoutMS: 5000,
      serverSelectionTimeoutMS: 5000,
    });
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.warn('⚠️  MongoDB connection error - running in offline mode:', error.message);
    // Don't exit, allow the server to continue running without database
  }
};

// Start database connection in background (don't wait for it)
connectDB().catch(err => console.warn('DB Error:', err.message));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/reminders', remindersRoutes);
app.use('/api/routines', routinesRoutes);
app.use('/api/people', peopleRoutes);
app.use('/api/journey', journeyRoutes);
app.use('/api/timeline', timelineRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/medications', medicationsRoutes);
app.use('/api', geminiRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 MongoDB: ${process.env.MONGODB_URI || 'mongodb://localhost:27017/memoaid'}`);
});
