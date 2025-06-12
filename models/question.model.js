const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: [true, 'Question text is required']
  },
  questionType: {
    type: String,
    enum: ['multipleChoice', 'trueFalse', 'shortAnswer', 'essay', 'matching', 'fillInBlank'],
    required: [true, 'Question type is required']
  },
  options: [{
    text: String,
    isCorrect: Boolean,
    feedback: String
  }],
  correctAnswer: {
    type: mongoose.Schema.Types.Mixed
  },
  explanation: String,
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  tags: [String],
  media: {
    type: {
      type: String,
      enum: ['image', 'video', 'audio']
    },
    url: String
  },
  metadata: {
    type: Object,
    default: {}
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Question', questionSchema); 