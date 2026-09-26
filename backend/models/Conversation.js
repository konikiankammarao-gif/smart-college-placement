const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    relatedEntity: {
      type: String,
      enum: ['PlacementDrive', 'Application', 'General'],
      default: 'General',
    },
    relatedEntityId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    conversationType: {
      type: String,
      enum: [
        'STUDENT_OFFICER',
        'STUDENT_RECRUITER',
        'RECRUITER_OFFICER',
        'ADMIN_OFFICER',
        'ADMIN_RECRUITER',
        'ADMIN_STUDENT',
        'GENERAL',
      ],
      default: 'GENERAL',
    },
    lastMessage: {
      message: { type: String },
      senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      createdAt: { type: Date, default: Date.now },
    },
  },
  { timestamps: true }
);

conversationSchema.index({ participants: 1 });

module.exports = mongoose.model('Conversation', conversationSchema);
