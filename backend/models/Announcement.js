const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    targetType: {
      type: String,
      enum: [
        'ALL_USERS',
        'ALL_STUDENTS',
        'ALL_RECRUITERS',
        'ALL_OFFICERS',
        'SPECIFIC_DEPARTMENT',
        'SPECIFIC_BATCH',
        'SPECIFIC_DRIVE',
        'SPECIFIC_COMPANY',
        'SPECIFIC_STUDENT',
      ],
      default: 'ALL_USERS',
    },
    targetValue: {
      type: String,
      default: '',
    },
    priority: {
      type: String,
      enum: ['LOW', 'NORMAL', 'HIGH', 'URGENT'],
      default: 'NORMAL',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    expiresAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Announcement', announcementSchema);
