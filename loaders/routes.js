const express = require('express');
const authRoutes = require('../api/auth/auth.routes');
const { courseRoutes } = require('../api/course');
const organizationRoutes = require('../api/organization/organization.routes');
const exportRoutes = require('../api/xapi/exportRoutes');
const { lessonRoutes } = require('../api/lesson');

module.exports = (app) => {
  // API Routes
  const router = express.Router();

  // Mount routes
  router.use('/auth', authRoutes);
  router.use('/courses', courseRoutes);
  router.use('/lessons', lessonRoutes);
  // Add other routes here as they are created
  router.use('/organizations', organizationRoutes);
  router.use('/export', exportRoutes);
  // etc.

  // Mount router to /api/v1
  app.use('/api/v1', router);
}; 