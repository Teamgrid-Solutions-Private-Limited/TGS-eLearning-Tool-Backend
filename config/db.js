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

module.exports = mongoose; 