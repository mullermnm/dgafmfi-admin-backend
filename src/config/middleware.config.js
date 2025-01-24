const express = require('express');
const corsMiddleware = require('../middleware/cors.middleware');
const { morgan, requestLogger } = require('../middleware/logging.middleware');
const { notFoundHandler, errorHandler } = require('../middleware/error.middleware');
const { handleUploadError } = require('../middleware/upload.middleware');

const setupMiddleware = (app) => {
  console.log('Setting up middleware...');

  // CORS should be first
  app.use(corsMiddleware);
  
  // Logging middleware
  app.use(morgan);
  app.use(requestLogger);
  
  // Body parsing middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  console.log('Basic middleware setup completed');

  // These error handling middleware should be registered AFTER routes are set up
  return () => {
    console.log('Setting up error handling middleware...');
    // Error handling middleware (should be last)
    app.use(handleUploadError);
    app.use(notFoundHandler);
    app.use(errorHandler);
    console.log('Error handling middleware setup completed');
  };
};

module.exports = {
  setupMiddleware
};
