const { StatusCodes } = require('http-status-codes');

const notFoundHandler = (req, res) => {
  console.log(`[404] Route not found: ${req.method} ${req.path}`);
  res.status(StatusCodes.NOT_FOUND).json({
    success: false,
    message: 'Route not found',
    path: req.path,
    method: req.method
  });
};

const errorHandler = (err, req, res, next) => {
  console.error('[Error Handler]', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body,
    headers: req.headers
  });
  
  res.status(err.status || StatusCodes.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: err.message || 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};

module.exports = {
  notFoundHandler,
  errorHandler
};
