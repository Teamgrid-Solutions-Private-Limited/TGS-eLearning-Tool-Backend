const Question = require('../../models/question.model');
const asyncHandler = require('../../middleware/asyncHandler');
const { AppError } = require('../../middleware/errorHandler');

// @desc    Get all questions with optional filtering
// @route   GET /api/v1/questions
// @access  Private
exports.getQuestions = asyncHandler(async (req, res, next) => {
  // Build query from request parameters
  const query = {};
  
  // Filter by question type if provided
  if (req.query.questionType) {
    query.questionType = req.query.questionType;
  }
  
  // Filter by difficulty if provided
  if (req.query.difficulty) {
    query.difficulty = req.query.difficulty;
  }
  
  // Filter by tags if provided
  if (req.query.tags) {
    query.tags = { $in: req.query.tags.split(',') };
  }
  
  // Execute query
  const questions = await Question.find(query);
  
  res.status(200).json({
    success: true,
    count: questions.length,
    data: questions
  });
});

// @desc    Get single question
// @route   GET /api/v1/questions/:id
// @access  Private
exports.getQuestion = asyncHandler(async (req, res, next) => {
  const question = await Question.findById(req.params.id);
  
  if (!question) {
    return next(new AppError(`Question not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: question
  });
});

// @desc    Create new question
// @route   POST /api/v1/questions
// @access  Private
exports.createQuestion = asyncHandler(async (req, res, next) => {
  const question = await Question.create(req.body);

  res.status(201).json({
    success: true,
    data: question
  });
});

// @desc    Update question
// @route   PUT /api/v1/questions/:id
// @access  Private
exports.updateQuestion = asyncHandler(async (req, res, next) => {
  let question = await Question.findById(req.params.id);

  if (!question) {
    return next(new AppError(`Question not found with id of ${req.params.id}`, 404));
  }

  question = await Question.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: question
  });
});

// @desc    Delete question
// @route   DELETE /api/v1/questions/:id
// @access  Private
exports.deleteQuestion = asyncHandler(async (req, res, next) => {
  const question = await Question.findById(req.params.id);

  if (!question) {
    return next(new AppError(`Question not found with id of ${req.params.id}`, 404));
  }

  await question.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
}); 