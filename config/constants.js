module.exports = {
  // User roles
  ROLES: {
    ADMIN: 'admin',
    INSTRUCTOR: 'instructor',
    STUDENT: 'student'
  },

  // Course status
  COURSE_STATUS: {
    DRAFT: 'draft',
    PUBLISHED: 'published',
    ARCHIVED: 'archived'
  },

  // Assessment types
  ASSESSMENT_TYPES: {
    QUIZ: 'quiz',
    ASSIGNMENT: 'assignment',
    EXAM: 'exam'
  },

  // Question types
  QUESTION_TYPES: {
    MULTIPLE_CHOICE: 'multiple_choice',
    TRUE_FALSE: 'true_false',
    SHORT_ANSWER: 'short_answer',
    ESSAY: 'essay'
  },

  // File upload limits
  FILE_LIMITS: {
    IMAGE: 1024 * 1024 * 2, // 2MB
    VIDEO: 1024 * 1024 * 50, // 50MB
    DOCUMENT: 1024 * 1024 * 10 // 10MB
  },

  // Pagination defaults
  PAGINATION: {
    PAGE: 1,
    LIMIT: 10,
    MAX_LIMIT: 100
  },

  // JWT token types
  TOKEN_TYPES: {
    ACCESS: 'access',
    REFRESH: 'refresh',
    RESET_PASSWORD: 'reset_password',
    VERIFY_EMAIL: 'verify_email'
  }
}; 