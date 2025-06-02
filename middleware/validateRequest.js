const { validationResult } = require('express-validator');
const { AppError } = require('./errorHandler');

const validateRequest = (validations) => {
  return async (req, res, next) => {
    // Run all validations
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const extractedErrors = errors.array().map(err => ({
      field: err.param,
      message: err.msg
    }));

    return next(new AppError('Invalid request data', 400, extractedErrors));
  };
};

module.exports = validateRequest; 