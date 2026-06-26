require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { verifyGeminiSetup } = require('./utils/geminiHelper');

// Environment Variable Validation (Soft check for local development)
const requiredEnv = ['MONGO_URI', 'JWT_SECRET'];
requiredEnv.forEach(env => {
  if (!process.env[env]) {
    console.warn(`⚠️ WARNING: Missing environment variable ${env} in .env file`);
  }
});

const authRoutes = require('./routes/auth');
const workoutRoutes = require('./routes/workouts');
const mealRoutes = require('./routes/meals');
const profileRoutes = require('./routes/profile');
const weightRoutes = require('./routes/weight');
const notificationRoutes = require('./routes/notifications');

const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');

const app = express();

app.use(express.json());

// Robust CORS configuration for Production
const allowedOrigins = [
  'http://localhost:19000', // Expo Go
  'http://localhost:19006', // Expo Web
  'http://localhost:8081',  // New Expo Default
  /\.railway\.app$/,         // Any Railway deployment
  /\.pages\.dev$/,           // Cloudflare Pages deployments
  /\.vercel\.app$/,          // Any Vercel deployment
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    const isAllowed = allowedOrigins.some(allowed => {
      if (allowed instanceof RegExp) return allowed.test(origin);
      return allowed === origin;
    });

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// Health Check Route
app.get('/', (req, res) => {
  res.json({ 
    status: 'online', 
    message: 'PeakPulse API is running smoothly',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Temporary Diagnostic Route for Gemini
app.get('/api/test-gemini', async (req, res) => {
  const { generateContentWithFallback, getAvailableModels } = require('./utils/geminiHelper');
  try {
    const result = await generateContentWithFallback('Hello');
    return res.json({
      success: true,
      modelUsed: result.modelUsed,
      attempts: result.attempts,
      responseTime: result.responseTime,
      fallbackUsed: result.fallbackUsed,
      availableModels: getAvailableModels(),
      response: result.text
    });
  } catch (err) {
    console.error('❌ /api/test-gemini Error:', err.stack || err.message);
    return res.status(503).json({
      success: false,
      message: 'AI service is temporarily busy. Please try again shortly.',
      availableModels: getAvailableModels()
    });
  }
});

// Gemini Status Endpoint
app.get('/api/gemini-status', (req, res) => {
  const { getStartupResult } = require('./utils/geminiHelper');
  return res.json(getStartupResult());
});

app.use('/api/auth', authRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/weight', weightRoutes);
app.use('/api/steps', require('./routes/steps'));
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', require('./routes/admin'));
app.use('/api/consultations', require('./routes/consultations'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/content', require('./routes/content'));
// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await connectDB();
    
    // Verify Gemini setup and log models on boot
    await verifyGeminiSetup();

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`\n=========================================`);
      console.log(`🚀 SERVER IS LIVE ON PORT: ${PORT}`);
      console.log(`🌍 ENVIRONMENT: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 BASE URL: http://localhost:${PORT}`);
      console.log(`=========================================\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
})();
