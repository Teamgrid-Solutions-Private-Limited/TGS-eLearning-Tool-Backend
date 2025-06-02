const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    unique: true 
  },
  permissions: { 
    type: mongoose.Schema.Types.Mixed, 
    default: {} 
  },
  description: String,
  organization: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Organization' 
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Role', roleSchema); 