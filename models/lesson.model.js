const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  course: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Course', 
    required: true 
  },
  courseStructure: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CourseStructure',
    required: true
  },
  title: { 
    type: String, 
    required: true 
  },
  description: String,
  sequence: { 
    type: Number, 
    required: true 
  },
  duration: Number, // in minutes
  thumbnailUrl: String,
  objectives: [{ 
    type: String 
  }],
  prerequisites: {
    type: Object,
    default: {}
  },
  metadata: {
    type: Object,
    default: {}
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Lesson', lessonSchema); 