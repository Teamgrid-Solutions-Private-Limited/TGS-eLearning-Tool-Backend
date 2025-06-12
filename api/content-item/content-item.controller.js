const ContentItem = require('../../models/content-item.model');
const asyncHandler = require('../../middleware/asyncHandler');
const { AppError } = require('../../middleware/errorHandler');

// @desc    Get all content items
// @route   GET /api/v1/content-items
// @access  Private
exports.getContentItems = asyncHandler(async (req, res, next) => {
  let query = {};
  
  // Filter by lessonId if provided
  if (req.query.lessonId) {
    query.lessonId = req.query.lessonId;
  }
  
  const contentItems = await ContentItem.find(query)
    .populate({
      path: 'lessonId',
      select: 'title sequence courseStructure course',
      populate: [
        { path: 'courseStructure', select: 'title sequence' },
        { path: 'course', select: 'title' }
      ]
    });
  
  res.status(200).json({
    success: true,
    count: contentItems.length,
    data: contentItems
  });
});

// @desc    Get single content item
// @route   GET /api/v1/content-items/:id
// @access  Private
exports.getContentItem = asyncHandler(async (req, res, next) => {
  const contentItem = await ContentItem.findById(req.params.id)
    .populate({
      path: 'lessonId',
      select: 'title sequence courseStructure course',
      populate: [
        { path: 'courseStructure', select: 'title sequence' },
        { path: 'course', select: 'title' }
      ]
    });
  
  if (!contentItem) {
    return next(new AppError(`Content item not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: contentItem
  });
});

// @desc    Create new content item
// @route   POST /api/v1/content-items
// @access  Private
exports.createContentItem = asyncHandler(async (req, res, next) => {
  const contentItem = await ContentItem.create(req.body);

  res.status(201).json({
    success: true,
    data: contentItem
  });
});

// @desc    Update content item
// @route   PUT /api/v1/content-items/:id
// @access  Private
exports.updateContentItem = asyncHandler(async (req, res, next) => {
  let contentItem = await ContentItem.findById(req.params.id);

  if (!contentItem) {
    return next(new AppError(`Content item not found with id of ${req.params.id}`, 404));
  }

  contentItem = await ContentItem.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  }).populate({
    path: 'lessonId',
    select: 'title sequence courseStructure course',
    populate: [
      { path: 'courseStructure', select: 'title sequence' },
      { path: 'course', select: 'title' }
    ]
  });

  res.status(200).json({
    success: true,
    data: contentItem
  });
});

// @desc    Delete content item
// @route   DELETE /api/v1/content-items/:id
// @access  Private
exports.deleteContentItem = asyncHandler(async (req, res, next) => {
  const contentItem = await ContentItem.findById(req.params.id);

  if (!contentItem) {
    return next(new AppError(`Content item not found with id of ${req.params.id}`, 404));
  }

  await contentItem.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
}); 