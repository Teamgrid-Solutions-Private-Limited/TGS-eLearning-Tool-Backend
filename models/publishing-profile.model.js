const mongoose = require('mongoose');

const PublishingProfileSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true 
  },
  format: { 
    type: String, 
    required: true,
    enum: ['PDF', 'HTML5', 'Mobile', 'SCORM_1.2', 'SCORM_2004', 'xAPI'] 
  },
  organizationId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Organization', 
    required: true 
  },
  isDefault: { 
    type: Boolean, 
    default: false 
  },
  settings: { 
    type: mongoose.Schema.Types.Mixed, 
    default: {} 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Auto-update 'updatedAt' on save
PublishingProfileSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('PublishingProfile', PublishingProfileSchema); 