const { body } = require('express-validator');
const { COURSE_STATUS } = require('../../config/constants');

exports.createCourseValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Course title is required')
    .isLength({ max: 200 })
    .withMessage('Course title cannot be more than 200 characters'),

  body('description')
    .trim()
    .notEmpty()
    .withMessage('Course description is required'),

  body('duration')
    .isNumeric()
    .withMessage('Duration must be a number')
    .notEmpty()
    .withMessage('Course duration is required'),

  body('level')
    .trim()
    .notEmpty()
    .withMessage('Course level is required')
    .isIn(['beginner', 'intermediate', 'advanced'])
    .withMessage('Invalid course level'),

  body('objectives')
    .isArray()
    .withMessage('Objectives must be an array')
    .notEmpty()
    .withMessage('At least one learning objective is required'),

  body('objectives.*')
    .trim()
    .notEmpty()
    .withMessage('Learning objective cannot be empty'),

  body('prerequisites')
    .optional()
    .isArray()
    .withMessage('Prerequisites must be an array'),

  body('prerequisites.*')
    .trim()
    .notEmpty()
    .withMessage('Prerequisite cannot be empty'),

  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),

  body('tags.*')
    .trim()
    .notEmpty()
    .withMessage('Tag cannot be empty'),

  body('status')
    .optional()
    .isIn(Object.values(COURSE_STATUS))
    .withMessage('Invalid course status')
];

exports.updateCourseValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Course title cannot be more than 200 characters'),

  body('duration')
    .optional()
    .isNumeric()
    .withMessage('Duration must be a number'),

  body('level')
    .optional()
    .trim()
    .isIn(['beginner', 'intermediate', 'advanced'])
    .withMessage('Invalid course level'),

  body('objectives')
    .optional()
    .isArray()
    .withMessage('Objectives must be an array'),

  body('objectives.*')
    .trim()
    .notEmpty()
    .withMessage('Learning objective cannot be empty'),

  body('prerequisites')
    .optional()
    .isArray()
    .withMessage('Prerequisites must be an array'),

  body('prerequisites.*')
    .trim()
    .notEmpty()
    .withMessage('Prerequisite cannot be empty'),

  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),

  body('tags.*')
    .trim()
    .notEmpty()
    .withMessage('Tag cannot be empty'),

  body('status')
    .optional()
    .isIn(Object.values(COURSE_STATUS))
    .withMessage('Invalid course status')
];

exports.createLessonValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Lesson title is required')
    .isLength({ max: 200 })
    .withMessage('Lesson title cannot be more than 200 characters'),

  body('description')
    .trim()
    .notEmpty()
    .withMessage('Lesson description is required'),

  body('content')
    .trim()
    .notEmpty()
    .withMessage('Lesson content is required'),

  body('duration')
    .isNumeric()
    .withMessage('Duration must be a number')
    .notEmpty()
    .withMessage('Lesson duration is required'),

  body('order')
    .isNumeric()
    .withMessage('Order must be a number')
    .notEmpty()
    .withMessage('Lesson order is required'),

  body('resources')
    .optional()
    .isArray()
    .withMessage('Resources must be an array'),

  body('resources.*.title')
    .trim()
    .notEmpty()
    .withMessage('Resource title is required'),

  body('resources.*.type')
    .trim()
    .notEmpty()
    .withMessage('Resource type is required'),

  body('resources.*.url')
    .optional()
    .isURL()
    .withMessage('Resource URL must be valid')
];

exports.rateCourseValidation = [
  body('rating')
    .isNumeric()
    .withMessage('Rating must be a number')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),

  body('review')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Review cannot be more than 500 characters')
]; 