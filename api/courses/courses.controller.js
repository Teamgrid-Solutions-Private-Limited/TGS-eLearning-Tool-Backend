const path = require('path');
const { AppError } = require('../../middleware/errorHandler');
const Course = require('../../models/course.model');
const asyncHandler = require('../../middleware/asyncHandler');
const { uploadFile } = require('../../utils/fileUpload');

// @desc    Get all courses
// @route   GET /api/v1/courses
// @access  Public
exports.getCourses = asyncHandler(async (req, res, next) => {
  // Build query
  const query = Course.find()
    .populate('instructor', 'firstName lastName email')
    .populate('organization', 'name');

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Course.countDocuments();

  query.skip(startIndex).limit(limit);

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
// @access  Public
exports.getCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id)
    .populate('instructor', 'firstName lastName email')
    .populate('organization', 'name')
    .populate('enrolledStudents', 'firstName lastName email');

  if (!course) {
    return next(new AppError(`Course not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: course
  });
});

// @desc    Create new course
// @route   POST /api/v1/courses
// @access  Private/Instructor
exports.createCourse = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.instructor = req.user.id;
  req.body.organization = req.user.organization;

  const course = await Course.create(req.body);

  res.status(201).json({
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
    return next(new AppError(`Course not found with id of ${req.params.id}`, 404));
  }

  // Make sure user is course instructor
  if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError(`User ${req.user.id} is not authorized to update this course`, 401));
  }

  course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: course
  });
});

// @desc    Delete course
// @route   DELETE /api/v1/courses/:id
// @access  Private/Instructor
exports.deleteCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(new AppError(`Course not found with id of ${req.params.id}`, 404));
  }

  // Make sure user is course instructor
  if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError(`User ${req.user.id} is not authorized to delete this course`, 401));
  }

  await course.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Upload course thumbnail
// @route   PUT /api/v1/courses/:id/thumbnail
// @access  Private/Instructor
exports.uploadCourseThumbnail = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(new AppError(`Course not found with id of ${req.params.id}`, 404));
  }

  // Make sure user is course instructor
  if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError(`User ${req.user.id} is not authorized to update this course`, 401));
  }

  const file = await uploadFile(req.files.file, 'thumbnails', ['image/jpeg', 'image/png']);
  course.thumbnail = file.filename;
  await course.save();

  res.status(200).json({
    success: true,
    data: course
  });
});

// @desc    Enroll in course
// @route   POST /api/v1/courses/:id/enroll
// @access  Private/Student
exports.enrollCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(new AppError(`Course not found with id of ${req.params.id}`, 404));
  }

  // Check if already enrolled
  if (course.enrolledStudents.includes(req.user.id)) {
    return next(new AppError('Already enrolled in this course', 400));
  }

  course.enrolledStudents.push(req.user.id);
  await course.save();

  res.status(200).json({
    success: true,
    data: course
  });
});

// @desc    Get lessons for course
// @route   GET /api/v1/courses/:id/lessons
// @access  Private
exports.getLessonsByCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(new AppError(`Course not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    count: course.lessons.length,
    data: course.lessons
  });
});

// @desc    Add lesson to course
// @route   POST /api/v1/courses/:id/lessons
// @access  Private/Instructor
exports.createLesson = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(new AppError(`Course not found with id of ${req.params.id}`, 404));
  }

  // Make sure user is course instructor
  if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError(`User ${req.user.id} is not authorized to add lessons to this course`, 401));
  }

  course.lessons.push(req.body);
  await course.save();

  res.status(200).json({
    success: true,
    data: course.lessons[course.lessons.length - 1]
  });
});

// @desc    Update lesson
// @route   PUT /api/v1/courses/:courseId/lessons/:lessonId
// @access  Private/Instructor
exports.updateLesson = asyncHandler(async (req, res, next) => {
  let course = await Course.findById(req.params.courseId);

  if (!course) {
    return next(new AppError(`Course not found with id of ${req.params.courseId}`, 404));
  }

  // Make sure user is course instructor
  if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError(`User ${req.user.id} is not authorized to update lessons in this course`, 401));
  }

  let lesson = course.lessons.id(req.params.lessonId);

  if (!lesson) {
    return next(new AppError(`Lesson not found with id of ${req.params.lessonId}`, 404));
  }

  lesson.set(req.body);
  await course.save();

  res.status(200).json({
    success: true,
    data: lesson
  });
});

// @desc    Delete lesson
// @route   DELETE /api/v1/courses/:courseId/lessons/:lessonId
// @access  Private/Instructor
exports.deleteLesson = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.courseId);

  if (!course) {
    return next(new AppError(`Course not found with id of ${req.params.courseId}`, 404));
  }

  // Make sure user is course instructor
  if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError(`User ${req.user.id} is not authorized to delete lessons in this course`, 401));
  }

  course.lessons.id(req.params.lessonId).remove();
  await course.save();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Rate course
// @route   POST /api/v1/courses/:id/rate
// @access  Private/Student
exports.rateCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(new AppError(`Course not found with id of ${req.params.id}`, 404));
  }

  // Check if enrolled
  if (!course.enrolledStudents.includes(req.user.id)) {
    return next(new AppError('Must be enrolled in the course to rate it', 400));
  }

  // Check if already rated
  if (course.ratings.find(rating => rating.user.toString() === req.user.id)) {
    return next(new AppError('Already rated this course', 400));
  }

  course.ratings.push({
    rating: req.body.rating,
    review: req.body.review,
    user: req.user.id
  });

  await course.save();

  res.status(200).json({
    success: true,
    data: course
  });
});

// @desc    Get enrolled courses
// @route   GET /api/v1/courses/enrolled/me
// @access  Private
exports.getEnrolledCourses = asyncHandler(async (req, res, next) => {
  const courses = await Course.find({ enrolledStudents: req.user.id })
    .populate('instructor', 'firstName lastName email')
    .populate('organization', 'name');

  res.status(200).json({
    success: true,
    count: courses.length,
    data: courses
  });
});

// @desc    Get instructor courses
// @route   GET /api/v1/courses/instructor/me
// @access  Private/Instructor
exports.getMyCourses = asyncHandler(async (req, res, next) => {
  const courses = await Course.find({ instructor: req.user.id })
    .populate('organization', 'name')
    .populate('enrolledStudents', 'firstName lastName email');

  res.status(200).json({
    success: true,
    count: courses.length,
    data: courses
  });
}); 