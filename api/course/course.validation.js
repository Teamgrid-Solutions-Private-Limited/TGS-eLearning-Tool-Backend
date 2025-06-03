const { body, param } = require('express-validator');

exports.validateCreateCourse = [
  body('title')
    .notEmpty().withMessage('Course title is required')
    .isLength({ max: 200 }).withMessage('Title cannot be more than 200 characters'),
  
  body('subtitle')
    .optional()
    .isLength({ max: 500 }).withMessage('Subtitle cannot be more than 500 characters'),
  
  body('description')
    .notEmpty().withMessage('Course description is required'),
  
  body('category')
    .notEmpty().withMessage('Category is required'),
  
  body('difficulty')
    .notEmpty().withMessage('Difficulty level is required')
    .isIn(['beginner', 'intermediate', 'advanced', 'expert']).withMessage('Invalid difficulty level'),
  
  body('language')
    .optional()
    .default('en'),
  
  body('metadata')
    .optional()
    .isObject().withMessage('Metadata must be an object'),
  
  body('metadata.duration')
    .notEmpty().withMessage('Course duration is required')
    .isNumeric().withMessage('Duration must be a number'),
  
  body('tags')
    .optional()
    .isArray().withMessage('Tags must be an array'),
  
  body('objectives')
    .optional()
    .isArray().withMessage('Objectives must be an array'),
  
  body('outcomes')
    .optional()
    .isArray().withMessage('Outcomes must be an array'),
  
  body('structure')
    .optional()
    .isMongoId().withMessage('Invalid structure ID format'),
  
  body('thumbnail')
    .optional()
    .isURL().withMessage('Thumbnail must be a valid URL'),
  
  body('previewVideo')
    .optional()
    .isURL().withMessage('Preview video must be a valid URL'),
  
  body('resources')
    .optional()
    .isArray().withMessage('Resources must be an array')
    .custom((value) => value.every(id => /^[0-9a-fA-F]{24}$/.test(id)))
    .withMessage('Invalid resource ID format'),
  
  body('assessments')
    .optional()
    .isArray().withMessage('Assessments must be an array')
    .custom((value) => value.every(id => /^[0-9a-fA-F]{24}$/.test(id)))
    .withMessage('Invalid assessment ID format'),
  
  body('publishingProfile')
    .optional()
    .isMongoId().withMessage('Invalid publishing profile ID format'),
  
  body('settings')
    .optional()
    .isObject().withMessage('Settings must be an object'),
  
  body('settings.isPublic')
    .optional()
    .isBoolean().withMessage('isPublic must be a boolean'),
  
  body('settings.requiresEnrollment')
    .optional()
    .isBoolean().withMessage('requiresEnrollment must be a boolean'),
  
  body('settings.allowGuestAccess')
    .optional()
    .isBoolean().withMessage('allowGuestAccess must be a boolean'),
  
  body('settings.completionCriteria')
    .optional()
    .isObject().withMessage('Completion criteria must be an object'),
  
  body('settings.completionCriteria.type')
    .optional()
    .isIn(['all', 'percentage', 'assessment']).withMessage('Invalid completion criteria type'),
  
  body('settings.completionCriteria.value')
    .optional()
    .isFloat({ min: 0, max: 100 }).withMessage('Completion value must be between 0 and 100')
];

exports.validateUpdateCourse = [
  param('id')
    .isMongoId().withMessage('Invalid course ID format'),
  ...exports.validateCreateCourse.map(validation => validation.optional())
];

exports.validateGetCourse = [
  param('id')
    .isMongoId().withMessage('Invalid course ID format')
];

exports.validateDuplicateCourse = [
  param('id')
    .isMongoId().withMessage('Invalid course ID format'),
  body('title')
    .optional()
    .isLength({ max: 200 }).withMessage('Title cannot be more than 200 characters')
]; 