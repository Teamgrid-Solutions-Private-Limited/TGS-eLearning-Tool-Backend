const { body } = require('express-validator');

exports.validateMediaAsset = [
  body('name').notEmpty().withMessage('Name is required'),
  body('type').isIn(['image', 'video', 'audio', 'document', 'other']).withMessage('Invalid type'),
  body('url').isURL().withMessage('Invalid URL'),
  body('uploadedBy').notEmpty().withMessage('UploadedBy is required'),
  body('organization').notEmpty().withMessage('Organization is required')
];