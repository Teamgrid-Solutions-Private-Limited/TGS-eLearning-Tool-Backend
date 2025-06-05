const mongoose = require('mongoose');
const CourseStructure = require('../../models/course-structure.model');

// Format validation errors
const formatValidationErrors = (error) => {
  const errors = {};
  error.details.forEach((detail) => {
    const key = detail.path[0];
    errors[key] = detail.message;
  });
  return errors;
};

// Check if course exists
const checkCourseExists = async (courseId) => {
  const Course = mongoose.model('Course');
  const course = await Course.findById(courseId);
  if (!course) {
    throw new Error('Course not found');
  }
  return course;
};

// Get next sequence number for a course
const getNextSequence = async (courseId) => {
  const lastStructure = await CourseStructure.findOne({ courseId })
    .sort({ sequence: -1 })
    .select('sequence');
  return lastStructure ? lastStructure.sequence + 1 : 1;
};

// Validate sequence uniqueness within a course
const validateSequenceUniqueness = async (courseId, sequence, excludeId = null) => {
  const query = {
    courseId,
    sequence,
    ...(excludeId && { _id: { $ne: excludeId } })
  };
  
  const existing = await CourseStructure.findOne(query);
  if (existing) {
    throw new Error('A structure with this sequence number already exists in this course');
  }
};

// Reorder sequences after deletion
const reorderSequences = async (courseId, deletedSequence) => {
  await CourseStructure.updateMany(
    { 
      courseId, 
      sequence: { $gt: deletedSequence } 
    },
    { $inc: { sequence: -1 } }
  );
};

// Build query with filters and pagination
const buildQuery = (filters = {}, options = {}) => {
  const query = CourseStructure.find(filters);
  
  // Apply sorting
  if (options.sort) {
    query.sort(options.sort);
  } else {
    query.sort({ sequence: 1 });
  }
  
  // Apply population
  if (options.populate) {
    query.populate(options.populate);
  }
  
  // Apply pagination
  if (options.page && options.limit) {
    const skip = (options.page - 1) * options.limit;
    query.skip(skip).limit(options.limit);
  }
  
  return query;
};

module.exports = {
  formatValidationErrors,
  checkCourseExists,
  getNextSequence,
  validateSequenceUniqueness,
  reorderSequences,
  buildQuery
}; 