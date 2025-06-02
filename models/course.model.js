const mongoose = require('mongoose');
const { COURSE_STATUS } = require('../config/constants');

const lessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a lesson title'],
    trim: true,
    maxlength: [200, 'Lesson title cannot be more than 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a lesson description']
  },
  content: {
    type: String,
    required: [true, 'Please add lesson content']
  },
  duration: {
    type: Number,
    required: [true, 'Please add lesson duration in minutes']
  },
  order: {
    type: Number,
    required: true
  },
  resources: [{
    title: String,
    type: String,
    url: String,
    file: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a course title'],
    trim: true,
    maxlength: [200, 'Course title cannot be more than 200 characters']
  },
  slug: {
    type: String,
    unique: true
  },
  description: {
    type: String,
    required: [true, 'Please add a course description']
  },
  thumbnail: {
    type: String,
    default: 'no-photo.jpg'
  },
  status: {
    type: String,
    enum: Object.values(COURSE_STATUS),
    default: COURSE_STATUS.DRAFT
  },
  duration: {
    type: Number,
    required: [true, 'Please add course duration in minutes']
  },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: [true, 'Please add course level']
  },
  prerequisites: [{
    type: String
  }],
  objectives: [{
    type: String,
    required: [true, 'Please add at least one learning objective']
  }],
  instructor: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  organization: {
    type: mongoose.Schema.ObjectId,
    ref: 'Organization',
    required: true
  },
  lessons: [lessonSchema],
  enrolledStudents: [{
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  }],
  ratings: [{
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },
    review: String,
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  averageRating: {
    type: Number,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot be more than 5']
  },
  tags: [{
    type: String,
    trim: true
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create course slug from the title
courseSchema.pre('save', function(next) {
  this.slug = this.title
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
  next();
});

// Calculate average rating
courseSchema.methods.getAverageRating = async function() {
  const stats = await this.model('Course').aggregate([
    {
      $match: { _id: this._id }
    },
    {
      $unwind: '$ratings'
    },
    {
      $group: {
        _id: '$_id',
        averageRating: { $avg: '$ratings.rating' }
      }
    }
  ]);

  try {
    await this.model('Course').findByIdAndUpdate(this._id, {
      averageRating: stats[0]?.averageRating || 0
    });
  } catch (err) {
    console.error(err);
  }
};

// Call getAverageRating after save
courseSchema.post('save', function() {
  this.getAverageRating();
});

// Call getAverageRating before remove
courseSchema.pre('remove', function() {
  this.getAverageRating();
});

module.exports = mongoose.model('Course', courseSchema); 