const express = require('express');
const { protect, authorize } = require('../../middleware/auth');
const { ROLES } = require('../../config/constants');
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
    authorize(ROLES.ADMIN, ROLES.INSTRUCTOR),
    validateRequest(createCourseValidation),
    createCourse
  );

router.route('/:id')
  .get(getCourse)
  .put(
    protect,
    authorize(ROLES.ADMIN, ROLES.INSTRUCTOR),
    validateRequest(updateCourseValidation),
    updateCourse
  )
  .delete(protect, authorize(ROLES.ADMIN, ROLES.INSTRUCTOR), deleteCourse);

router.route('/:id/thumbnail')
  .put(protect, authorize(ROLES.ADMIN, ROLES.INSTRUCTOR), uploadCourseThumbnail);

router.route('/:id/enroll')
  .post(protect, authorize(ROLES.STUDENT), enrollCourse);

router.route('/:id/lessons')
  .get(protect, getLessonsByCourse)
  .post(
    protect,
    authorize(ROLES.ADMIN, ROLES.INSTRUCTOR),
    validateRequest(createLessonValidation),
    createLesson
  );

router.route('/:courseId/lessons/:lessonId')
  .put(
    protect,
    authorize(ROLES.ADMIN, ROLES.INSTRUCTOR),
    validateRequest(createLessonValidation),
    updateLesson
  )
  .delete(protect, authorize(ROLES.ADMIN, ROLES.INSTRUCTOR), deleteLesson);

router.route('/:id/rate')
  .post(
    protect,
    authorize(ROLES.STUDENT),
    validateRequest(rateCourseValidation),
    rateCourse
  );

router.get('/enrolled/me', protect, getEnrolledCourses);
router.get('/instructor/me', protect, authorize(ROLES.INSTRUCTOR), getMyCourses);

module.exports = router; 