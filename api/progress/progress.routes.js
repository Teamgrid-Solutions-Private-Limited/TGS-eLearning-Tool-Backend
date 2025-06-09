const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progress.controller');
const { protect } = require('../middleware/auth.middleware');

// All routes are protected and require authentication
router.use(protect);

// Update or create progress
// POST /api/progress
router.post('/', progressController.updateProgress);

// Get progress for a specific course
// GET /api/progress/user/:userId/course/:courseId
router.get('/user/:userId/course/:courseId', progressController.getCourseProgress);

// Get all progress records for a user
// GET /api/progress/user/:userId
router.get('/user/:userId', progressController.getUserProgress);

// Reset progress for a course
// DELETE /api/progress/user/:userId/course/:courseId
router.delete('/user/:userId/course/:courseId', progressController.resetProgress);

module.exports = router; 