const { validationResult } = require('express-validator');
const { AppError } = require('./errorHandler');

const validateRequest = () => {
  return async (req, res, next) => {
    try {
      // Log the incoming request body
      console.log('Incoming request body:', req.body);
      
      const errors = validationResult(req);
      if (errors.isEmpty()) {
        return next();
      }

      const extractedErrors = errors.array().map(err => ({
        field: err.param,
        message: err.msg,
        value: err.value
      }));

      // Send a more detailed error response
      return res.status(400).json({
        success: false,
        errors: extractedErrors,
        receivedBody: req.body // Include the received body in the response
      });
    } catch (error) {
      console.error('Validation error:', error);
      return next(new AppError('Validation failed', 400));
    }
  };
};

module.exports = validateRequest; 