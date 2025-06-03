const jwt = require('jsonwebtoken');
const { AppError } = require('./errorHandler');
const config = require('../config/env');
const User = require('../models/user.model');
const Role = require('../models/role.model');

const protect = async (req, res, next) => {
  try {
    let token;

    // Get token from Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('Not authorized to access this route', 401));
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, config.jwt.secret);

      // Get user from token with populated role
      const user = await User.findById(decoded.id).select('-password').populate('role');

      if (!user) {
        return next(new AppError('User not found', 401));
      }

      // Add user to request object
      req.user = user;
      next();
    } catch (err) {
      return next(new AppError('Not authorized to access this route', 401));
    }
  } catch (err) {
    next(err);
  }
};

const authorize = (...roleNames) => {
  return async (req, res, next) => {
    try {
      // Get the user's role name
      const userRoleName = req.user.role.name;
      
      if (!roleNames.includes(userRoleName)) {
        return next(new AppError(`User role ${userRoleName} is not authorized to access this route`, 403));
      }
      next();
    } catch (err) {
      return next(new AppError('Role authorization error', 500));
    }
  };
};

module.exports = {
  protect,
  authorize
}; 