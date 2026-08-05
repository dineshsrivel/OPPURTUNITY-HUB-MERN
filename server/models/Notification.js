const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sender:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  type: {
    type: String,
    enum: [
      'application_update', 'new_application', 'profile_view',
      'company_approved', 'company_rejected', 'job_match',
      'deadline_reminder', 'system', 'new_message',
    ],
    required: true,
  },
  title:   { type: String, required: true, maxlength: 200 },
  message: { type: String, required: true, maxlength: 500 },
  link:    String, // relative URL to navigate to

  isRead:   { type: Boolean, default: false },
  readAt:   Date,

  // Optional metadata
  meta: { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true });

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
