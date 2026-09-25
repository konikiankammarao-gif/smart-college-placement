const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: [
        'NEW_DRIVE', 'ELIGIBLE_DRIVE', 'APPLICATION_SUBMITTED',
        'APPLICATION_SHORTLISTED', 'INTERVIEW_SCHEDULED', 'INTERVIEW_RESCHEDULED',
        'SELECTED', 'REJECTED', 'DEADLINE_REMINDER', 'GENERAL', 'SYSTEM'
      ],
      default: 'GENERAL',
    },
    relatedId: { type: mongoose.Schema.Types.ObjectId },
    relatedModel: { type: String },
    isRead: { type: Boolean, default: false },
    readAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
