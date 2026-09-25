const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    driveId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PlacementDrive',
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    status: {
      type: String,
      enum: ['APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW', 'SELECTED', 'REJECTED', 'WITHDRAWN'],
      default: 'APPLIED',
    },
    appliedAt: { type: Date, default: Date.now },
    resumeSnapshot: String, // resume URL at time of application
    coverLetter: String,
    statusHistory: [
      {
        status: String,
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        updatedAt: { type: Date, default: Date.now },
        remarks: String,
      },
    ],
    currentRound: { type: Number, default: 0 },
    feedback: String,
    offerLetterUrl: String,
  },
  { timestamps: true }
);

// Prevent duplicate applications
applicationSchema.index({ driveId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
