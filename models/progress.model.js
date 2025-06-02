const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  course: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Course', 
    required: true 
  },
  lesson: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Lesson' 
  },
  completionPercentage: { 
    type: Number, 
    default: 0, 
    min: 0, 
    max: 100 
  },
  completedLessons: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Lesson' 
  }],
  completedTopics: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Topic' 
  }],
  completedAssessments: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Assessment' 
  }],
  lastAccessedAt: Date,
  score: { 
    type: Number, 
    min: 0, 
    max: 100 
  },
  status: { 
    type: String, 
    enum: ['notStarted', 'inProgress', 'completed'], 
    default: 'notStarted' 
  },
  completedAt: Date
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Progress', progressSchema); 