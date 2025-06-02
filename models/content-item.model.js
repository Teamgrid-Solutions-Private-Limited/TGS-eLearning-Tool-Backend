const mongoose = require('mongoose');

const contentItemSchema = new mongoose.Schema({
  lessonId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Lesson',
    required: [true, 'Lesson ID is required']
  },
  title: {
    type: String,
    required: [true, 'Please add a content title'],
    trim: true
  },
  contentType: {
    type: String,
    required: [true, 'Content type is required'],
    trim: true
  },
  content: {
    type: mongoose.Schema.Types.Mixed,
    required: [true, 'Content is required']
  },
  xmlContent: {
    type: String
  },
  variables: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

module.exports = mongoose.model('ContentItem', contentItemSchema); 