const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const compression = require('compression');
const fileUpload = require('express-fileupload');
const path = require('path');

const { errorHandler, notFound } = require('./middleware/errorHandler');

// Load environment variables
require('./config/env');

const app = express();

// Load database
require('./config/db');

// Body parser
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// File Upload
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: path.join(__dirname, 'temp'),  // Windows-compatible temp directory
  createParentPath: true,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max file size
  debug: process.env.NODE_ENV === 'development',  // Enable debug logs in development
  safeFileNames: true,  // Remove special characters from file names
  preserveExtension: true,  // Keep file extensions
  abortOnLimit: true,  // Return an error if file size is exceeded
}));

// Security headers
app.use(helmet());

// CORS
app.use(cors());
app.options('*', cors());

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate limiting
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000, // 1 hour
  message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter);

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(hpp());

// Compression
app.use(compression());

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// Load routes
require('./loaders/routes')(app);

// Error handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;