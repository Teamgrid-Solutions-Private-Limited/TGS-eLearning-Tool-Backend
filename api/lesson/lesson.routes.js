const express = require('express');
const router = express.Router();
const lessonController = require('./lesson.controller');

// Create a new lesson
router.post('/', lessonController.createLesson);

// Get all lessons
router.get('/', lessonController.getLessons);

// Get a single lesson by ID
router.get('/:id', lessonController.getLessonById);

// Update a lesson
router.put('/:id', lessonController.updateLesson);

// Delete a lesson
router.delete('/:id', lessonController.deleteLesson);

module.exports = router; 