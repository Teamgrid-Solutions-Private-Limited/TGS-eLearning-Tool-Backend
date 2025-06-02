const mongoose = require('mongoose');

const xapiStatementSchema = new mongoose.Schema({
  organization: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Organization', 
    required: true 
  },
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  course: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Course' 
  },
  lesson: { 
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