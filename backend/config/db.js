const mongoose = require('mongoose');

const connectDB = async () => {
  const maxRetries = 5;
  let retries = 0;

  // Add event listeners for connection stability in production
  mongoose.connection.on('connected', () => {
    console.log('✅ MongoDB Connected Successfully to Atlas');
  });

  mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB connection error:', err.message);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️ MongoDB disconnected. Mongoose will auto-reconnect.');
  });

  while (retries < maxRetries) {
    try {
      await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 5000,
      });
      return;
    } catch (err) {
      retries++;
      console.error(`❌ MongoDB connection attempt ${retries}/${maxRetries} failed: ${err.message}`);
      if (retries >= maxRetries) {
        console.error('❌ Max connection retries reached. Database is offline. Failing connection.');
        throw new Error(`Database connection failed: ${err.message}`);
      }
      console.log('Waiting 2 seconds before retrying...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
};

module.exports = connectDB;
