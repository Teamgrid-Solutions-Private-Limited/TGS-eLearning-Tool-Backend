const { AppError } = require('../../middleware/errorHandler');
const Course = require('../../models/course.model');
const asyncHandler = require('../../middleware/asyncHandler');

// @desc    Create new course
// @route   POST /api/v1/courses
// @access  Private/Instructor
exports.createCourse = asyncHandler(async (req, res, next) => {
  // Debug logging
  console.log('User data:', {
    id: req.user.id,
    organization: req.user.organization,
    role: req.user.role
  });

  // Check if user has organization
  if (!req.user.organization) {
    return next(new AppError('User organization not found. Please ensure you belong to an organization.', 400));
  }

  // Get organization ID (handle both populated and unpopulated cases)
  const organizationId = req.user.organization._id || req.user.organization;

  // Add creator info and organization
  req.body.createdBy = req.user.id;
  req.body.updatedBy = req.user.id;
  req.body.organization = organizationId;

  const course = await Course.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Course created successfully',
    data: course
  });
});

// @desc    Get all courses
// @route   GET /api/v1/courses
// @access  Private
exports.getCourses = asyncHandler(async (req, res, next) => {
  // Copy query parameters
  const queryObj = { ...req.query };

  // Fields to exclude from filtering
  const excludeFields = ['page', 'sort', 'limit', 'fields', 'search'];
  excludeFields.forEach(field => delete queryObj[field]);

  // Filter by organization if not admin
  if (req.user.role.name !== 'admin') {
    queryObj.organization = req.user.organization;
  }

  // Create query string
  let queryStr = JSON.stringify(queryObj);
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

  // Build query
  let query = Course.find(JSON.parse(queryStr));

  // Search functionality
  if (req.query.search) {
    query = query.or([
      { title: { $regex: req.query.search, $options: 'i' } },
      { description: { $regex: req.query.search, $options: 'i' } }
    ]);
  }

  // Select Fields
  if (req.query.fields) {
    const fields = req.query.fields.split(',').join(' ');
    query = query.select(fields);
  }

  // Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Course.countDocuments(JSON.parse(queryStr));

  query = query.skip(startIndex).limit(limit);

  // Populate references
  query = query.populate([
    { path: 'createdBy', select: 'firstName lastName' },
    { path: 'organization', select: 'name' }
  ]);

  // Execute query
  const courses = await query;

  // Pagination result
  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }

  res.status(200).json({
    success: true,
    count: courses.length,
    pagination,
    data: courses
  });
});

// @desc    Get single course
// @route   GET /api/v1/courses/:id
// @access  Private
exports.getCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id)
    .populate([
      { path: 'createdBy', select: 'firstName lastName' },
      { path: 'organization', select: 'name' },
      { path: 'assessments' },
      { path: 'structure' }
    ]);

  if (!course) {
    return next(new AppError('Course not found', 404));
  }

  // Check if user has access to this course
  if (req.user.role.name !== 'admin' && course.organization.toString() !== req.user.organization.toString()) {
    return next(new AppError('Not authorized to access this course', 403));
  }

  res.status(200).json({
    success: true,
    data: course
  });
});

// @desc    Update course
// @route   PUT /api/v1/courses/:id
// @access  Private/Instructor
exports.updateCourse = asyncHandler(async (req, res, next) => {
  let course = await Course.findById(req.params.id);

  if (!course) {
    return next(new AppError('Course not found', 404));
  }

  // Make sure user is course creator or admin
  if (course.createdBy.toString() !== req.user.id && req.user.role.name !== 'admin') {
    return next(new AppError('Not authorized to update this course', 403));
  }

  // Add updater info
  req.body.updatedBy = req.user.id;

  course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    message: 'Course updated successfully',
    data: course
  });
});

// @desc    Delete course
// @route   DELETE /api/v1/courses/:id
// @access  Private/Instructor
exports.deleteCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(new AppError('Course not found', 404));
  }

  // Make sure user is course creator or admin
  if (course.createdBy.toString() !== req.user.id && req.user.role.name !== 'admin') {
    return next(new AppError('Not authorized to delete this course', 403));
  }

  await course.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Course deleted successfully',
    data: {}
  });
});

// @desc    Publish course
// @route   PUT /api/v1/courses/:id/publish
// @access  Private/Instructor
exports.publishCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(new AppError('Course not found', 404));
  }

  // Make sure user is course creator or admin
  if (course.createdBy.toString() !== req.user.id && req.user.role.name !== 'admin') {
    return next(new AppError('Not authorized to publish this course', 403));
  }

  await course.publish();

  res.status(200).json({
    success: true,
    message: 'Course published successfully',
    data: course
  });
});

// @desc    Archive course
// @route   PUT /api/v1/courses/:id/archive
// @access  Private/Instructor
exports.archiveCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(new AppError('Course not found', 404));
  }

  // Make sure user is course creator or admin
  if (course.createdBy.toString() !== req.user.id && req.user.role.name !== 'admin') {
    return next(new AppError('Not authorized to archive this course', 403));
  }

  await course.archive();

  res.status(200).json({
    success: true,
    message: 'Course archived successfully',
    data: course
  });
});

// @desc    Duplicate course
// @route   POST /api/v1/courses/:id/duplicate
// @access  Private/Instructor
exports.duplicateCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(new AppError('Course not found', 404));
  }

  // Make sure user is course creator or admin
  if (course.createdBy.toString() !== req.user.id && req.user.role.name !== 'admin') {
    return next(new AppError('Not authorized to duplicate this course', 403));
  }

  const duplicatedCourse = await course.duplicate(req.body.title);

  res.status(200).json({
    success: true,
    message: 'Course duplicated successfully',
    data: duplicatedCourse
  });
}); 