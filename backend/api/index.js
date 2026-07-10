const app = require('../server');
const connectDB = require('../config/db');

// Export the Express API
module.exports = async (req, res) => {
  // Ensure database is connected before handling the request
  // (connectDB has internal caching to prevent multiple connections)
  await connectDB();
  
  // Pass the request to the Express app
  return app(req, res);
};
