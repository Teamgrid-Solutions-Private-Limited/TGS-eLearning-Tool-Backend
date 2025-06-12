const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submission.controller');
const authenticate = require('../middleware/auth'); // your auth middleware

router.post(
  '/submit/:assessmentId',
  authenticate,
  submissionController.submitAssessment
);

router.get(
  '/assessment/:assessmentId',
  authenticate,
  submissionController.getSubmissionsByAssessment
);

router.get(
  '/my/:assessmentId',
  authenticate,
  submissionController.getUserSubmissions
);

module.exports = router;
