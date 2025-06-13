const mongoose = require('mongoose');

const courseStructureSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course ID is required']
  },
  title: {
    type: String,
    required: [true, 'Please add a structure title'],
    trim: true
  },
  sequence: {
    type: Number,
    required: [true, 'Sequence number is required']
  },
  objectives: [{
    type: String,
    required: [true, 'Please add at least one objective']
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual field for lessons
courseStructureSchema.virtual('lessons', {
  ref: 'Lesson',
  localField: '_id',
  foreignField: 'courseStructure',
  justOne: false
});

// Ensure sequence numbers are unique within a course
courseStructureSchema.index({ courseId: 1, sequence: 1 }, { unique: true });

module.exports = mongoose.model('CourseStructure', courseStructureSchema); 