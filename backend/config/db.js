const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Add event listeners for connection stability in production
    mongoose.connection.on('connected', () => {
      console.log('✅ MongoDB Connected Successfully to Atlas');
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected. Attempting to reconnect...');
    });

    await mongoose.connect(process.env.MONGO_URI);
  } catch (err) {
    console.error('❌ Initial MongoDB connection error:', err.message);
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

module.exports = connectDB;
