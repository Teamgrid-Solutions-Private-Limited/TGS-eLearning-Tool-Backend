const mongoose = require('mongoose');

const mediaAssetSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  type: { 
    type: String, 
    enum: ['image', 'video', 'audio', 'document', 'other'],
    required: true 
  },
  url: { 
    type: String, 
    required: true 
  },
  thumbnailUrl: String,
  mimeType: String,
  size: Number, // in bytes
  dimensions: String, // format: "widthxheight" (e.g., "1920x1080")
  duration: Number, // in seconds for audio/video
  uploadedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  organization: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Organization', 
    required: true 
  },
  usedIn: [{ 
    type: String 
  }], // array of content IDs where this asset is used
  status: { 
    type: String, 
    enum: ['uploaded', 'processing', 'ready', 'error'], 
    default: 'uploaded' 
  },
  metadata: { 
    type: mongoose.Schema.Types.Mixed, 
    default: {} 
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('MediaAsset', mediaAssetSchema); 