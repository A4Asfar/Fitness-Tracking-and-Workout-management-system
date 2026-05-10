require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

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
app.use(cors());

// Health Check Route
app.get('/', (req, res) => {
  res.send('Fitness Tracker API is running smoothly');
});

app.use('/api/auth', authRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/weight', weightRoutes);
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
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🔗 Local access: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
})();
