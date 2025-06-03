const express = require('express');
const { protect, authorize } = require('../../middleware/auth');
const { DEFAULT_ROLES } = require('../../config/constants');
const validateRequest = require('../../middleware/validateRequest');
const {
  createCourseValidation,
  updateCourseValidation,
  createLessonValidation,
  rateCourseValidation
} = require('./courses.validation');
const {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  uploadCourseThumbnail,
  enrollCourse,
  getLessonsByCourse,
  createLesson,
  updateLesson,
  deleteLesson,
  rateCourse,
  getEnrolledCourses,
  getMyCourses
} = require('./courses.controller');

const router = express.Router();

// Course routes
router.route('/')
  .get(getCourses)
  .post(
    protect,
    authorize(DEFAULT_ROLES.ADMIN, DEFAULT_ROLES.AUTHOR),
    validateRequest(createCourseValidation),
    createCourse
  );

router.route('/:id')
  .get(getCourse)
  .put(
    protect,
    authorize(DEFAULT_ROLES.ADMIN, DEFAULT_ROLES.AUTHOR, DEFAULT_ROLES.INSTRUCTOR),
    validateRequest(updateCourseValidation),
    updateCourse
  )
  .delete(protect, authorize(DEFAULT_ROLES.ADMIN), deleteCourse);

router.route('/:id/thumbnail')
  .put(protect, authorize(DEFAULT_ROLES.ADMIN, DEFAULT_ROLES.AUTHOR), uploadCourseThumbnail);

router.route('/:id/enroll')
  .post(protect, authorize(DEFAULT_ROLES.STUDENT), enrollCourse);

router.route('/:id/lessons')
  .get(protect, getLessonsByCourse)
  .post(
    protect,
    authorize(DEFAULT_ROLES.ADMIN, DEFAULT_ROLES.AUTHOR),
    validateRequest(createLessonValidation),
    createLesson
  );

router.route('/:courseId/lessons/:lessonId')
  .put(
    protect,
    authorize(DEFAULT_ROLES.ADMIN, DEFAULT_ROLES.AUTHOR),
    validateRequest(createLessonValidation),
    updateLesson
  )
  .delete(protect, authorize(DEFAULT_ROLES.ADMIN, DEFAULT_ROLES.AUTHOR), deleteLesson);

router.route('/:id/rate')
  .post(
    protect,
    authorize(DEFAULT_ROLES.STUDENT),
    validateRequest(rateCourseValidation),
    rateCourse
  );

router.get('/enrolled/me', protect, getEnrolledCourses);
router.get('/instructor/me', protect, authorize(DEFAULT_ROLES.INSTRUCTOR), getMyCourses);
router.get('/author/me', protect, authorize(DEFAULT_ROLES.AUTHOR), getMyCourses);

module.exports = router; 