const mongoose = require('mongoose');

const packageExportSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Course',
    required: true
  },
  type: {
    type: String,
    enum: ['SCORM 1.2', 'SCORM 2004', 'xAPI'],
    required: [true, 'Please specify the export type']
  },
  status: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed'],
    default: 'Pending'
  },
  exportPath: {
    type: String,
    required: [true, 'Export path is required']
  },
  exportedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  organizationId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Organization',
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

module.exports = mongoose.model('PackageExport', packageExportSchema); 