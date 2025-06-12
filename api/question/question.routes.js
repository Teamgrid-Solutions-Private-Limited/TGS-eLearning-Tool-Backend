const express = require('express');
const {
  getQuestions,
  getQuestion,
  createQuestion,
  updateQuestion,
  deleteQuestion
} = require('./question.controller');

const router = express.Router();

// Middleware can be added here
// const { protect, authorize } = require('../../middleware/auth');

router
  .route('/')
  .get(getQuestions)
  .post(createQuestion);

router
  .route('/:id')
  .get(getQuestion)
  .put(updateQuestion)
  .delete(deleteQuestion);

module.exports = router; 