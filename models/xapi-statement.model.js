const mongoose = require('mongoose');

const xapiStatementSchema = new mongoose.Schema({
  organizationId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Organization', 
    required: true 
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  courseId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Course' 
  },
  lessonId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Lesson' 
  },
  actor: { 
    type: mongoose.Schema.Types.Mixed, 
    required: true 
  },
  verb: { 
    type: mongoose.Schema.Types.Mixed, 
    required: true 
  },
  object: { 
    type: mongoose.Schema.Types.Mixed, 
    required: true 
  },
  result: { 
    type: mongoose.Schema.Types.Mixed 
  },
  context: { 
    type: mongoose.Schema.Types.Mixed 
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  },
  processed: { 
    type: Boolean, 
    default: false 
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('XapiStatement', xapiStatementSchema); 