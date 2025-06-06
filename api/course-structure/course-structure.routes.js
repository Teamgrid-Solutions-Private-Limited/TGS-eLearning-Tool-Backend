const express = require('express');
const router = express.Router();
const courseStructureController = require('./course-structure.controller');
const {
  validateCreate,
  validateUpdate,
  validateGetById,
  validateGetAll,
  validateBulkUpdate,
  validateDelete
} = require('./course-structure.validation');

// Create a new course structure
router.post('/', validateCreate, courseStructureController.createCourseStructure);

// Get all course structures
router.get('/', validateGetAll, courseStructureController.getCourseStructures);

// Get a single course structure by ID
router.get('/:id', validateGetById, courseStructureController.getCourseStructureById);

// Update a course structure
router.put('/:id', validateUpdate, courseStructureController.updateCourseStructure);

// Delete a course structure
router.delete('/:id', validateDelete, courseStructureController.deleteCourseStructure);

// Bulk update sequence numbers
router.put('/bulk/sequences', validateBulkUpdate, courseStructureController.updateSequences);

module.exports = router; 