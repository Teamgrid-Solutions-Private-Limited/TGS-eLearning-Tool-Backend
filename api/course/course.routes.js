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

const { protect, authorize } = require('../../middleware/auth');

// Protect all routes
router.use(protect);

// Public routes (still need authentication)
router.get('/', getCourses);
router.get('/:id', validateGetCourse, getCourse);

// Instructor/Admin only routes
router.post('/', authorize('instructor', 'admin'), validateCreateCourse, createCourse);
router.put('/:id', authorize('instructor', 'admin'), validateUpdateCourse, updateCourse);
router.delete('/:id', authorize('instructor', 'admin'), validateGetCourse, deleteCourse);

// Course state management routes
router.put('/:id/publish', authorize('instructor', 'admin'), validateGetCourse, publishCourse);
router.put('/:id/archive', authorize('instructor', 'admin'), validateGetCourse, archiveCourse);
router.post('/:id/duplicate', authorize('instructor', 'admin'), validateDuplicateCourse, duplicateCourse);

module.exports = router; 