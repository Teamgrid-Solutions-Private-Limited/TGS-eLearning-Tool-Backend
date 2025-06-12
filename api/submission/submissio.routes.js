const express = require('express');
const router = express.Router();
const submissionController = require('./submission.controller');
const { protect, authorize } = require('../../middleware/auth');

// Protect all routes
router.use(protect);

// Submit an assessment
router.post(
  '/:assessmentId/submit',
  submissionController.submitAssessment
);

// Get all submissions for an assessment (admin/instructor only)
router.get(
  '/assessment/:assessmentId',
  authorize('admin', 'instructor'),
  submissionController.getSubmissionsByAssessment
);

// Get user's own submissions for an assessment
router.get(
  '/my/:assessmentId',
  submissionController.getUserSubmissions
);

// Get detailed view of a submission
router.get(
  '/:submissionId/details',
  submissionController.getSubmissionDetails
);

// Grade an essay question (admin/instructor only)
router.post(
  '/grade-essay',
  authorize('admin', 'instructor'),
  submissionController.gradeEssayQuestion
);

module.exports = router;
