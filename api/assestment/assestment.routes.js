const express = require('express');
const router = express.Router();
const assessmentController = require('./assessment.controller');
const { protect, authorize } = require('../middleware/auth');

// Protect all routes
router.use(protect);

// Routes for assessment management
router
  .route('/')
  .get(authorize('admin', 'instructor', 'student'), assessmentController.getAllAssessments)
  .post(authorize('admin', 'instructor'), assessmentController.createAssessment);

router
  .route('/:id')
  .get(authorize('admin', 'instructor', 'student'), assessmentController.getAssessmentById)
  .put(authorize('admin', 'instructor'), assessmentController.updateAssessment)
  .delete(authorize('admin', 'instructor'), assessmentController.deleteAssessment);

// Routes for course-specific assessments
router
  .route('/course/:courseId')
  .get(authorize('admin', 'instructor', 'student'), assessmentController.getAssessmentsByCourse);

// Routes for lesson-specific assessments
router
  .route('/lesson/:lessonId')
  .get(authorize('admin', 'instructor', 'student'), assessmentController.getAssessmentsByLesson);

// Route for submitting assessment answers
router
  .route('/:id/submit')
  .post(authorize('admin', 'instructor', 'student'), assessmentController.submitAssessment);

module.exports = router; 