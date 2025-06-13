const express = require('express');
const router = express.Router();
const {
  createCourse,
  getCourses,
  getCourse,
  updateCourse,
  deleteCourse,
  publishCourse,
  archiveCourse,
  duplicateCourse
} = require('./course.controller');

const {
  validateCreateCourse,
  validateUpdateCourse,
  validateGetCourse,
  validateDuplicateCourse
} = require('./course.validation');

const { protect, authorize, requireVerifiedEmail } = require('../../middleware/auth');

// Protect all routes
router.use(protect);

// Public routes (still need authentication)
router.get('/', getCourses);
router.get('/:id', validateGetCourse, getCourse);

// Instructor/Admin only routes - require email verification
router.post('/', authorize('instructor', 'admin'), requireVerifiedEmail, validateCreateCourse, createCourse);
router.put('/:id', authorize('instructor', 'admin'), requireVerifiedEmail, validateUpdateCourse, updateCourse);
router.delete('/:id', authorize('instructor', 'admin'), requireVerifiedEmail, validateGetCourse, deleteCourse);

// Course state management routes - require email verification
router.put('/:id/publish', authorize('instructor', 'admin'), requireVerifiedEmail, validateGetCourse, publishCourse);
router.put('/:id/archive', authorize('instructor', 'admin'), requireVerifiedEmail, validateGetCourse, archiveCourse);
router.post('/:id/duplicate', authorize('instructor', 'admin'), requireVerifiedEmail, validateDuplicateCourse, duplicateCourse);

module.exports = router; 