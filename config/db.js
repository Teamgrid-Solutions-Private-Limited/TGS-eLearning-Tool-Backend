const mongoose = require('mongoose');
const config = require('./env');
const logger = require('../utils/logger');

mongoose.connect(config.mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  logger.info('MongoDB connected successfully');
}).catch((err) => {
  logger.error('MongoDB connection error:', err);
  process.exit(1);
});

// Load models
require('../models/user.model');
require('../models/organization.model');
require('../models/course.model');
require('../models/lesson.model');
require('../models/topic.model');
require('../models/assessment.model');
require('../models/content-item.model');
require('../models/course-structure.model');
require('../models/media-asset.model');
require('../models/package-export.model');
require('../models/progress.model');
require('../models/publishing-profile.model');
require('../models/role.model');
require('../models/xapi-statement.model');

module.exports = mongoose; 