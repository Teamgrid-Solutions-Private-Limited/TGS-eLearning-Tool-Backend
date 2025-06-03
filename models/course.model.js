const mongoose = require('mongoose');
const { COURSE_STATUS } = require('../config/constants');

const courseSchema = new mongoose.Schema({
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: [true, 'Organization is required']
  },
  title: {
    type: String,
    required: [true, 'Course title is required'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  subtitle: {
    type: String,
    trim: true,
    maxlength: [500, 'Subtitle cannot be more than 500 characters']
  },
  description: {
    type: String,
    required: [true, 'Course description is required']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  difficulty: {
    type: String,
    required: [true, 'Difficulty level is required'],
    enum: ['beginner', 'intermediate', 'advanced', 'expert']
  },
  language: {
    type: String,
    required: [true, 'Language is required'],
    default: 'en'
  },
  tags: [{
    type: String,
    trim: true
  }],
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  // Authoring tool specific fields

  sourceFile: {
    type: String, // URL or path to the source file
    trim: true
  },
  exportSettings: {
    format: {
      type: String,
      enum: ['scorm1.2', 'scorm2004', 'xapi', 'aicc', 'cmi5'],
      default: 'scorm2004'
    },
    version: String,
    options: mongoose.Schema.Types.Mixed
  },
  // Learning objectives and outcomes
  objectives: [{
    type: String,
    trim: true
  }],
  outcomes: [{
    type: String,
    trim: true
  }],
  // Course structure and content
  structure: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CourseStructure'
  },
  // Media and resources
  thumbnail: {
    type: String,
    default: 'default-course-thumbnail.jpg'
  },
  previewVideo: String,
  resources: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MediaAsset'
  }],
  // Assessment and progress tracking
  assessments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assessment'
  }],
  // Publishing settings
  publishingProfile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PublishingProfile'
  },
  // Version control
  version: {
    type: Number,
    default: 1
  },
  previousVersions: [{
    version: Number,
    publishedAt: Date,
    changes: String,
    sourceFile: String
  }],
  // Status and dates
  status: {
    type: String,
    enum: Object.values(COURSE_STATUS),
    default: COURSE_STATUS.DRAFT
  },
  publishedAt: Date,
  // User tracking
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Course settings
  settings: {
    isPublic: {
      type: Boolean,
      default: false
    },
    requiresEnrollment: {
      type: Boolean,
      default: true
    },
    allowGuestAccess: {
      type: Boolean,
      default: false
    },
    completionCriteria: {
      type: {
        type: String,
        enum: ['all', 'percentage', 'assessment'],
        default: 'all'
      },
      value: {
        type: Number,
        default: 100
      }
    }
  },
  // Analytics and tracking
  analytics: {
    totalEnrollments: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: Number,
      default: 0
    },
    completionRate: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
courseSchema.index({ organization: 1, title: 1 }, { unique: true });
courseSchema.index({ status: 1 });
courseSchema.index({ tags: 1 });
courseSchema.index({ category: 1 });

// Virtual fields for related data
courseSchema.virtual('lessons', {
  ref: 'Lesson',
  localField: '_id',
  foreignField: 'course',
  justOne: false
});

courseSchema.virtual('topics', {
  ref: 'Topic',
  localField: '_id',
  foreignField: 'course',
  justOne: false
});

courseSchema.virtual('progress', {
  ref: 'Progress',
  localField: '_id',
  foreignField: 'course',
  justOne: false
});

// Middleware to update version on content change
courseSchema.pre('save', async function(next) {
  if (this.isModified('content') || this.isModified('structure')) {
    this.version += 1;
  }
  next();
});

// Methods
courseSchema.methods.publish = async function() {
  if (this.status === COURSE_STATUS.DRAFT) {
    // Store current version info
    this.previousVersions.push({
      version: this.version,
      publishedAt: new Date(),
      sourceFile: this.sourceFile,
      changes: 'Initial publication'
    });

    this.status = COURSE_STATUS.PUBLISHED;
    this.publishedAt = new Date();
    await this.save();
  }
};

courseSchema.methods.archive = async function() {
  this.status = COURSE_STATUS.ARCHIVED;
  await this.save();
};

courseSchema.methods.duplicate = async function(newTitle) {
  const Course = this.constructor;
  const duplicatedCourse = new Course({
    ...this.toObject(),
    _id: undefined,
    title: newTitle || `${this.title} (Copy)`,
    status: COURSE_STATUS.DRAFT,
    version: 1,
    publishedAt: undefined,
    previousVersions: [],
    analytics: {
      totalEnrollments: 0,
      averageRating: 0,
      completionRate: 0
    }
  });

  return await duplicatedCourse.save();
};

module.exports = mongoose.model('Course', courseSchema); 