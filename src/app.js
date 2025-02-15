const express = require('express');
const path = require('path');

// Import configurations
const { setupMiddleware } = require('./config/middleware.config');
const { setupRoutes } = require('./config/routes.config');
const { setupUploads } = require('./config/uploads.config');

// Create Express app
const app = express();

// Setup uploads directory
const uploadDir = setupUploads();

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Setup initial middleware (before routes)
const setupErrorHandlers = setupMiddleware(app);

// Routes
const authRoutes = require('./routes/auth.routes');
const newsRoutes = require('./routes/news.routes');
const blogsRoutes = require('./routes/blogs.routes');
const eventRoutes = require('./routes/event.routes');
const galleryRoutes = require('./routes/gallery.routes');
const dashboardRoutes = require('./routes/dashboard.routes');

app.use('/api/auth', authRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/blogs', blogsRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/galleries', galleryRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Setup error handling middleware (after routes)
setupErrorHandlers();

module.exports = app;
