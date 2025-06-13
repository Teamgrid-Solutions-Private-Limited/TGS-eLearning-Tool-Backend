const express = require('express');
const router = express.Router();
const assestmentController = require('../assestment/assestment.controller');
const { protect, authorize } = require('../../middleware/auth');

// Protect all routes
// router.use(protect);

// Basic CRUD operations
// router
//   .route('/')
//   .get(authorize('admin', 'instructor', 'student'), assessmentController.getAllAssessments)
//   .post(assessmentController.createAssessment);

// router
//   .route('/:id')
//   .get(authorize('admin', 'instructor', 'student'), assessmentController.getAssessmentById)
//   .put(authorize('admin', 'instructor'), assessmentController.updateAssessment)
//   .delete(authorize('admin', 'instructor'), assessmentController.deleteAssessment);

// // Assessment submission
// router.post('/:id/submit', authorize('admin', 'instructor', 'student'), assessmentController.submitAssessment);
router.post('/assestment/create',assestmentController.createAssessment)
// Filter assessments
// router.get('/course/:courseId', authorize('admin', 'instructor', 'student'), assessmentController.getAssessmentsByCourse);
// router.get('/lesson/:lessonId', authorize('admin', 'instructor', 'student'), assessmentController.getAssessmentsByLesson);

module.exports = router; 