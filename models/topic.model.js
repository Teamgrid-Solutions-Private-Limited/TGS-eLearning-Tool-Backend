const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
  lesson: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Lesson', 
    required: true 
  },
  title: { 
    type: String, 
    required: true 
  },
  content: { 
    type: mongoose.Schema.Types.Mixed, 
    required: true 
  },
  sequence: { 
    type: Number, 
    required: true 
  },
  contentType: { 
    type: String, 
    enum: ['video', 'text', 'interactive', 'audio', 'document', 'scorm'], 
    required: true 
  },
  duration: Number, // in minutes
  settings: { 
    type: mongoose.Schema.Types.Mixed, 
    default: {} 
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Topic', topicSchema); 