const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  student:     { type: mongoose.Schema.Types.ObjectId, ref: 'User',        required: true },
  opportunity: { type: mongoose.Schema.Types.ObjectId, ref: 'Opportunity', required: true },

  status: {
    type:    String,
    enum:    ['applied', 'under_review', 'interview', 'selected', 'rejected', 'withdrawn'],
    default: 'applied',
  },
  coverLetter:    { type: String, maxlength: 2000 },
  resumeSnapshot: String, // URL of resume at time of application

  // ── Status timeline ────────────────────────────────────────────────────────
  statusHistory: [{
    status:    String,
    changedAt: { type: Date, default: Date.now },
    note:      String,
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  }],

  // ── Interview details ──────────────────────────────────────────────────────
  interviewDate: Date,
  interviewMode: { type: String, enum: ['online', 'offline', 'phone'] },
  interviewLink: String,
  interviewNote: String,

  // ── Internal (not visible to student) ─────────────────────────────────────
  internalNote: { type: String, select: false },

  appliedAt:   { type: Date, default: Date.now },
  lastUpdated: { type: Date, default: Date.now },
}, { timestamps: true });

// One application per student per opportunity
applicationSchema.index({ student: 1, opportunity: 1 }, { unique: true });
applicationSchema.index({ student: 1, status: 1 });
applicationSchema.index({ opportunity: 1, status: 1 });

module.exports = mongoose.model('Application', applicationSchema);
