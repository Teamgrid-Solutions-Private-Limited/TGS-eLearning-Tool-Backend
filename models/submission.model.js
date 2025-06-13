const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  assessment: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Assessment',
    required: true
  },
  answers: [{
    questionItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assessment.questions',
      required: true
    },
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      required: true
    },
    userAnswer: mongoose.Schema.Types.Mixed,
    isCorrect: Boolean,
    score: Number,
    feedback: String
  }],
  score: {
    type: Number,
    required: true
  },
  maxScore: {
    type: Number,
    required: true
  },
  percentage: {
    type: Number,
    required: true
  },
  passed: {
    type: Boolean,
    required: true
  },
  attemptNumber: {
    type: Number,
    required: true
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  submittedAt: { 
    type: Date, 
    default: Date.now 
  },
  timeSpent: {
    type: Number, // in seconds
  },
  xapiSynced: { 
    type: Boolean, 
    default: false 
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Submission', submissionSchema);
  