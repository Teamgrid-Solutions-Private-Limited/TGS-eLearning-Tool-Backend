const { body, param, query, validationResult } = require('express-validator');
const mongoose = require('mongoose');

// Custom validator for ObjectId
const isValidObjectId = (value) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new Error('Invalid ID format');
  }
  return true;
};

// Validation middleware to check results
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = {};
    errors.array().forEach(error => {
      formattedErrors[error.path] = error.msg;
    });
    return res.status(400).json({ errors: formattedErrors });
  }
  next();
};

// Create course structure validation
const validateCreate = [
  body('courseId')
    .notEmpty()
    .withMessage('Course ID is required')
    .custom(isValidObjectId)
    .withMessage('Invalid course ID format'),

  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 3 })
    .withMessage('Title must be at least 3 characters long')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),

  body('sequence')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Sequence must be a positive integer'),

  body('objectives')
    .isArray({ min: 1 })
    .withMessage('At least one objective is required'),

  body('objectives.*')
    .trim()
    .isLength({ min: 5 })
    .withMessage('Each objective must be at least 5 characters long')
    .isLength({ max: 500 })
    .withMessage('Each objective cannot exceed 500 characters'),

  validate
];

// Update course structure validation
const validateUpdate = [
  param('id')
    .custom(isValidObjectId)
    .withMessage('Invalid structure ID format'),

  body('title')
    .optional()
    .trim()
    .isLength({ min: 3 })
    .withMessage('Title must be at least 3 characters long')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),

  body('sequence')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Sequence must be a positive integer'),

  body('objectives')
    .optional()
    .isArray({ min: 1 })
    .withMessage('At least one objective is required'),

  body('objectives.*')
    .optional()
    .trim()
    .isLength({ min: 5 })
    .withMessage('Each objective must be at least 5 characters long')
    .isLength({ max: 500 })
    .withMessage('Each objective cannot exceed 500 characters'),

  validate
];

// Get course structure by ID validation
const validateGetById = [
  param('id')
    .custom(isValidObjectId)
    .withMessage('Invalid structure ID format'),
  
  validate
];

// Get all course structures validation
const validateGetAll = [
  query('courseId')
    .optional()
    .custom(isValidObjectId)
    .withMessage('Invalid course ID format'),

  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  validate
];

// Bulk update sequences validation
const validateBulkUpdate = [
  body('updates')
    .isArray({ min: 1 })
    .withMessage('At least one update is required'),

  body('updates.*.id')
    .custom(isValidObjectId)
    .withMessage('Invalid structure ID format'),

  body('updates.*.sequence')
    .isInt({ min: 1 })
    .withMessage('Sequence must be a positive integer'),

  validate
];

// Delete course structure validation
const validateDelete = [
  param('id')
    .custom(isValidObjectId)
    .withMessage('Invalid structure ID format'),
  
  validate
];

module.exports = {
  validateCreate,
  validateUpdate,
  validateGetById,
  validateGetAll,
  validateBulkUpdate,
  validateDelete
}; 