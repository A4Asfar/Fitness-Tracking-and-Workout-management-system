const app = require('../server');
const connectDB = require('../config/db');

// Export the Express API
module.exports = async (req, res) => {
  // Fix: CORS Preflight requests do NOT need a database connection.
  // Responding immediately prevents strict enterprise proxies from timing out.
  if (req.method === 'OPTIONS') {
    return app(req, res);
  }

  // Ensure database is connected before handling actual API requests
  // (connectDB has internal caching to prevent multiple connections)
  await connectDB();
  
  // Pass the request to the Express app
  return app(req, res);
};
