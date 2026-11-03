/**
 * Centralized Error Handling Middleware for MongoDB & Express
 */
const errorHandler = (err, req, res, next) => {
  console.error('[Error Handler]', err.message || err);

  // MongoDB Duplicate key error (code 11000)
  if (err.code === 11000 || (err.message && err.message.includes('E11000 duplicate key error'))) {
    return res.status(409).json({
      success: false,
      message: 'A record with this unique value (e.g. Email, SKU, or Name) already exists.'
    });
  }

  // Mongoose CastError (Invalid ObjectId format)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: `Invalid ID format: ${err.value}`
    });
  }

  // Mongoose Schema ValidationError
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    return res.status(400).json({
      success: false,
      message: messages.join('. ')
    });
  }

  const statusCode = res.statusCode !== 200 && res.statusCode !== 201 ? res.statusCode : (err.statusCode || 500);

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

/**
 * 404 Route Not Found Middleware
 */
const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`
  });
};

module.exports = {
  errorHandler,
  notFoundHandler
};
