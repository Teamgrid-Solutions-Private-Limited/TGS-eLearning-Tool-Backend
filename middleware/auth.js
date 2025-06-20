const jwt = require('jsonwebtoken');
const { AppError } = require('./errorHandler');
const config = require('../config/env');
const User = require('../models/user.model');
const asyncHandler = require('./asyncHandler');

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

      // Debug logging
      console.log('Token decoded:', decoded);

      // Get user from token with populated role and organization
      const user = await User.findById(decoded.id)
        .select('-password')
        .populate({
          path: 'role',
          select: 'name permissions'
        })
        .populate({
          path: 'organization',
          select: 'name type status'
        });

      // Debug logging
      console.log('User found:', {
        id: user?._id,
        hasOrg: !!user?.organization,
        orgId: user?.organization?._id,
        roleName: user?.role?.name,
        isEmailVerified: user?.isEmailVerified
      });

      if (!user) {
        return next(new AppError('User not found', 401));
      }

      if (!user.organization) {
        return next(new AppError('User organization not found', 401));
      }

      // Add user to request object
      req.user = {
        id: user.id,
        _id: user._id,
        organization: user.organization,
        role: user.role,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isEmailVerified: user.isEmailVerified
      };
      
      next();
    } catch (err) {
      console.error('Auth error:', err);
      return next(new AppError('Not authorized to access this route', 401));
    }
  } catch (err) {
    console.error('Protect middleware error:', err);
    next(err);
  }
};

const authorize = (...roleNames) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.role || !req.user.role.name) {
        return next(new AppError('User role not found', 403));
      }

      // Get the user's role name
      const userRoleName = req.user.role.name;
      
      if (!roleNames.includes(userRoleName)) {
        return next(new AppError(`User role ${userRoleName} is not authorized to access this route`, 403));
      }
      next();
    } catch (err) {
      console.error('Authorization error:', err);
      return next(new AppError('Role authorization error', 500));
    }
  };
};

// Middleware to require verified email
const requireVerifiedEmail = asyncHandler(async (req, res, next) => {
  if (!req.user.isEmailVerified) {
    return next(
      new AppError(
        'Email verification required. Please verify your email before accessing this resource.',
        403
      )
    );
  }
  next();
});

module.exports = {
  protect,
  authorize,
  requireVerifiedEmail
}; 