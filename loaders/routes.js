const express = require('express');
const authRoutes = require('../api/auth/auth.routes');
const { courseRoutes } = require('../api/course');
const organizationRoutes = require('../api/organization/organization.routes');
const exportRoutes = require('../api/xapi/exportRoutes');
const { lessonRoutes } = require('../api/lesson');
const { courseStructureRoutes } = require('../api/course-structure');
const contentItemRoutes = require('../api/content-item/content-item.routes');
const xapiRoutes = require('../api/xapi/xapi.routes');
const progressRoutes = require('../api/progress/progress.routes');
const assestmentRoutes = require('../api/assestment/assestment.routes');
const submissionRoutes = require('../api/submission/submissio.routes');
const questionRoutes = require('../api/question/question.routes');
const mediaAssetRoutes = require('../api/media-assets/media-asset.route');

module.exports = (app) => {
  // API Routes
  const router = express.Router();

  // Mount routes
  router.use('/auth', authRoutes);
  router.use('/courses', courseRoutes);
  router.use('/lessons', lessonRoutes);
  router.use('/course-structures', courseStructureRoutes);
  router.use('/content-items', contentItemRoutes);
  router.use('/media-assets', mediaAssetRoutes);
  // Add other routes here as they are created
  router.use('/organizations', organizationRoutes);
  router.use('/export', exportRoutes);
  router.use('/xapi', xapiRoutes);
  router.use('/progress', progressRoutes);
  router.use('/assestment', assestmentRoutes);
  router.use('/submission', submissionRoutes);
  router.use('/questions', questionRoutes);

  // etc.

  // Mount router to /api/v1
  app.use('/api/v1', router);
};