const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    assessment: { type: mongoose.Schema.Types.ObjectId, ref: 'Assessment' },
    answers: mongoose.Schema.Types.Mixed,
    score: Number,
    percentage: Number,
    passed: Boolean,
    attemptNumber: Number,
    submittedAt: { type: Date, default: Date.now },
    xapiSynced: { type: Boolean, default: false } // if you want to track sync status
  });
  
  module.exports = mongoose.model('Submission', submissionSchema);
  