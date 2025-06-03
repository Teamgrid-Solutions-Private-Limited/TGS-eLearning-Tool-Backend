const { body } = require('express-validator');

exports.createOrganizationValidation = [
  body('name')
    .exists().withMessage('Organization name is required')
    .trim()
    .notEmpty().withMessage('Organization name cannot be empty')
    .isLength({ max: 100 }).withMessage('Organization name cannot be more than 100 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Description cannot be more than 500 characters'),
  
  body('website')
    .optional()
    .trim()
    .matches(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/)
    .withMessage('Please provide a valid website URL'),
  
  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Please provide a valid email'),
  
  body('phone')
    .optional()
    .trim()
    .isLength({ max: 20 }).withMessage('Phone number cannot be longer than 20 characters'),
  
  body('address')
    .optional()
    .isObject().withMessage('Address must be an object'),
  
  body('address.street')
    .optional()
    .trim()
    .notEmpty().withMessage('Street address cannot be empty'),
  
  body('address.city')
    .optional()
    .trim()
    .notEmpty().withMessage('City cannot be empty'),
  
  body('address.state')
    .optional()
    .trim()
    .notEmpty().withMessage('State cannot be empty'),
  
  body('address.country')
    .optional()
    .trim()
    .notEmpty().withMessage('Country cannot be empty'),
  
  body('address.zipCode')
    .optional()
    .trim()
    .notEmpty().withMessage('Zip code cannot be empty')
];

exports.updateOrganizationValidation = [
  body('name')
    .optional()
    .trim()
    .notEmpty().withMessage('Organization name cannot be empty')
    .isLength({ max: 100 }).withMessage('Organization name cannot be more than 100 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Description cannot be more than 500 characters'),
  
  body('website')
    .optional()
    .trim()
    .matches(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/)
    .withMessage('Please provide a valid website URL'),
  
  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Please provide a valid email'),
  
  body('phone')
    .optional()
    .trim()
    .isLength({ max: 20 }).withMessage('Phone number cannot be longer than 20 characters'),
  
  body('isActive')
    .optional()
    .isBoolean().withMessage('isActive must be a boolean value')
]; 