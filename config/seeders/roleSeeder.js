const Role = require('../../models/role.model');
const { DEFAULT_ROLES } = require('../constants');

const seedRoles = async () => {
  try {
    // Create default roles with their permissions
    const roles = [
      {
        name: DEFAULT_ROLES.ADMIN,
        description: 'Administrator with full system access',
        permissions: {
          users: ['create', 'read', 'update', 'delete'],
          courses: ['create', 'read', 'update', 'delete'],
          lessons: ['create', 'read', 'update', 'delete'],
          enrollments: ['create', 'read', 'update', 'delete'],
          assignments: ['create', 'read', 'update', 'delete'],
          // Add more permissions as needed
        }
      },
      {
        name: DEFAULT_ROLES.INSTRUCTOR,
        description: 'Course instructor who teaches and manages courses',
        permissions: {
          courses: ['read', 'update'],
          lessons: ['read', 'update'],
          students: ['read'],
          assignments: ['create', 'read', 'update', 'delete'],
          grades: ['create', 'read', 'update'],
          announcements: ['create', 'read', 'update', 'delete'],
          discussions: ['create', 'read', 'update', 'delete']
          // Add more permissions as needed
        }
      },
      {
        name: DEFAULT_ROLES.AUTHOR,
        description: 'Course content creator',
        permissions: {
          courses: ['create', 'read', 'update'],
          lessons: ['create', 'read', 'update', 'delete'],
          content: ['create', 'read', 'update', 'delete'],
          media: ['create', 'read', 'update', 'delete'],
          // Add more permissions as needed
        }
      },
      {
        name: DEFAULT_ROLES.STUDENT,
        description: 'Student enrolled in courses',
        permissions: {
          courses: ['read'],
          lessons: ['read'],
          assignments: ['read', 'create'],
          discussions: ['read', 'create', 'update'],
          grades: ['read'],
          // Add more permissions as needed
        }
      },
      {
        name: DEFAULT_ROLES.EDITOR,
        description: 'Can edit and manage content',
        permissions: {
          courses: ['read', 'update'],
          lessons: ['read', 'update'],
          content: ['read', 'update'],
          media: ['read', 'update']
        }
      },
      {
        name: DEFAULT_ROLES.REVIEWER,
        description: 'Reviews and approves content',
        permissions: {
          courses: ['read'],
          lessons: ['read'],
          content: ['read'],
          media: ['read'],
          reviews: ['create', 'read', 'update']
        }
      },
      {
        name: DEFAULT_ROLES.VIEWER,
        description: 'View-only access to content',
        permissions: {
          courses: ['read'],
          lessons: ['read'],
          content: ['read'],
          media: ['read']
        }
      }
    ];

    // Insert roles if they don't exist
    for (const role of roles) {
      await Role.findOneAndUpdate(
        { name: role.name },
        role,
        { upsert: true, new: true }
      );
    }

    console.log('Default roles seeded successfully');
  } catch (error) {
    console.error('Error seeding roles:', error);
    throw error;
  }
};

module.exports = seedRoles;