const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Internal Server Error';
  let category = 'INTERNAL_ERROR';

  // 1. Mongoose Validation / Cast Error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map(val => val.message).join(', ');
    category = 'VALIDATION_ERROR';
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid field format: ${err.path}`;
    category = 'VALIDATION_ERROR';
  }

  // 2. JWT Errors
  else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Your session has expired. Please sign in again.';
    category = 'AUTH_ERROR';
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Authentication failed.';
    category = 'AUTH_ERROR';
  }

  // 3. MongoDB Connection Issues
  else if (err.message && (err.message.includes('MongooseServerSelectionError') || err.message.includes('MongoNetworkError') || err.name === 'MongoNetworkError')) {
    statusCode = 503;
    message = 'Database is temporarily unavailable. Please try again shortly.';
    category = 'DATABASE_ERROR';
  }

  // 4. Gemini API Failures
  else if (err.name === 'GeminiError' || (err.message && (err.message.includes('Gemini') || err.message.includes('AI service') || err.message.includes('generative-ai') || err.message.includes('GoogleGenerativeAI')))) {
    statusCode = 503;
    message = 'AI service is temporarily busy. Please try again shortly.';
    category = 'GEMINI_ERROR';
  }

  // 5. Timeout Errors
  else if (err.code === 'ETIMEDOUT' || err.message?.includes('timeout') || err.name === 'TimeoutError') {
    statusCode = 408;
    message = 'Request timed out. Please try again.';
    category = 'TIMEOUT_ERROR';
  }

  // Fallback status code mapping if set to something specific
  if (err.status) {
    statusCode = err.status;
  }

  // Categorize standard codes
  if (statusCode === 400 && category === 'INTERNAL_ERROR') category = 'BAD_REQUEST';
  if (statusCode === 401 && category === 'INTERNAL_ERROR') category = 'AUTH_ERROR';
  if (statusCode === 403) category = 'FORBIDDEN';
  if (statusCode === 404) category = 'NOT_FOUND';
  if (statusCode === 429) category = 'RATE_LIMIT_ERROR';
  if (statusCode === 502) category = 'BAD_GATEWAY';
  if (statusCode === 504) category = 'GATEWAY_TIMEOUT';

  // Save error category for the request tracing log
  req.errorCategory = category;

  // Calculate Response Time
  const responseTime = req.startTime ? `${Date.now() - req.startTime}ms` : 'unknown';

  // Build clean, non-sensitive request logs
  console.error('\n⚠️ --- ERROR LOG ---');
  console.error(`Request ID     : ${req.requestId || 'N/A'}`);
  console.error(`Route          : ${req.method} ${req.originalUrl}`);
  console.error(`User ID        : ${req.userId || 'Guest'}`);
  console.error(`Response Time  : ${responseTime}`);
  console.error(`Error Category : ${category}`);
  console.error(`Status Code    : ${statusCode}`);
  console.error(`Message        : ${message}`);
  if (process.env.NODE_ENV !== 'production' && err.stack) {
    console.error(`Stack          : ${err.stack.split('\n').slice(0, 3).join('\n')}`);
  }
  console.error('--------------------\n');

  res.status(statusCode).json({ message });
};

const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = { errorHandler, notFound, asyncHandler };
