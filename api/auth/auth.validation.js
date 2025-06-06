const { body } = require('express-validator');
const mongoose = require('mongoose');
const Organization = require('../../models/organization.model');
const { ROLES } = require('../../config/constants');
const Role = require('../../models/role.model');

exports.registerValidation = [
  body('firstName')
    .exists().withMessage('First name is required')
    .trim()
    .notEmpty().withMessage('First name cannot be empty')
    .isLength({ max: 50 }).withMessage('First name cannot be more than 50 characters'),
  
  body('lastName')
    .exists().withMessage('Last name is required')
    .trim()
    .notEmpty().withMessage('Last name cannot be empty')
    .isLength({ max: 50 }).withMessage('Last name cannot be more than 50 characters'),
  
  body('email')
    .exists().withMessage('Email is required')
    .trim()
    .notEmpty().withMessage('Email cannot be empty')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .exists().withMessage('Password is required')
    .trim()
    .notEmpty().withMessage('Password cannot be empty')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  
  body('role')
    .exists().withMessage('Role is required')
    .notEmpty().withMessage('Role cannot be empty')
    .custom(async (value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid role ID format');
      }
      
      // Check if role exists in database
      const role = await Role.findById(value);
      if (!role) {
        throw new Error('Role not found');
      }
      
      return true;
    }),

  body('organization')
    .exists().withMessage('Organization is required')
    .notEmpty().withMessage('Organization cannot be empty')
    .custom(async (value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid organization ID format');
      }
      
      // Check if organization exists and is active
      const organization = await Organization.findById(value);
      if (!organization) {
        throw new Error('Organization not found');
      }
      if (!organization.isActive) {
        throw new Error('Organization is not active');
      }
      
      return true;
    }),

  body('position')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Position cannot be more than 100 characters'),

  body('department')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Department cannot be more than 100 characters'),

  body('termsAccepted')
    .exists().withMessage('Terms acceptance is required')
    .isBoolean().withMessage('Terms acceptance must be a boolean')
    .custom((value) => {
      if (!value) {
        throw new Error('You must accept the terms and conditions');
      }
      return true;
    }),

  body('privacyPolicyAccepted')
    .exists().withMessage('Privacy policy acceptance is required')
    .isBoolean().withMessage('Privacy policy acceptance must be a boolean')
    .custom((value) => {
      if (!value) {
        throw new Error('You must accept the privacy policy');
      }
      return true;
    })
];

exports.loginValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email'),
  
  body('password')
    .trim()
    .notEmpty()
    .withMessage('Password is required')
];

exports.updatePasswordValidation = [
  body('currentPassword')
    .trim()
    .notEmpty()
    .withMessage('Current password is required'),
  
  body('newPassword')
    .trim()
    .notEmpty()
    .withMessage('New password is required')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
];

exports.forgotPasswordValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
];

exports.resetPasswordValidation = [
  body('password')
    .trim()
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
]; 