const mongoose = require('mongoose');

const assessmentSchema = new mongoose.Schema({
  lesson: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Lesson', 
    required: true 
  },
  course: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Course', 
    required: true 
  },
  title: { 
    type: String, 
    required: true 
  },
  description: String,
  type: { 
    type: String, 
    enum: ['quiz', 'test', 'assignment', 'survey'], 
    required: true 
  },
  passingScore: { 
    type: Number, 
    default: 70 
  },
  maxAttempts: { 
    type: Number, 
    default: 1 
  },
  questions: { 
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  settings: { 
    type: mongoose.Schema.Types.Mixed, 
    default: {} 
  },
  shuffleQuestions: { 
    type: Boolean, 
    default: false 
  },
  showFeedback: { 
    type: String, 
    enum: ['always', 'onCompletion', 'never'], 
    default: 'onCompletion' 
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Assessment', assessmentSchema); 