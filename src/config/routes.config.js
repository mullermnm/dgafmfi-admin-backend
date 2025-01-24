const express = require('express');

const authRoutes = require('../routes/auth.routes');
const newsRoutes = require('../routes/news.routes');
const galleryRoutes = require('../routes/gallery.routes');
const eventRoutes = require('../routes/event.routes');
const statsRoutes = require('../routes/stats.routes');
const apiRoutes = require('../routes');

const setupRoutes = (app) => {
  // Debug route to verify routing is working
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'API is working' });
  });

  console.log('Setting up routes...');

  // Mount routes with logging
  app.use('/api/auth', (req, res, next) => {
    console.log('[Route Debug] Auth route accessed:', req.method, req.path);
    next();
  }, authRoutes);

  app.use('/api/news', newsRoutes);
  app.use('/api/galleries', galleryRoutes);
  app.use('/api/events', eventRoutes);
  app.use('/api/stats', statsRoutes);
  
  // Mount general API routes last
  app.use('/api', apiRoutes);

  console.log('Routes setup completed');
};

module.exports = {
  setupRoutes
};