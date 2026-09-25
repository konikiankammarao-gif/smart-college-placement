const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema(
  {
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      required: true,
    },
    driveId: { type: mongoose.Schema.Types.ObjectId, ref: 'PlacementDrive' },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
    roundNumber: { type: Number, default: 1 },
    roundName: { type: String, required: true },
    roundType: {
      type: String,
      enum: ['Aptitude Test', 'Coding Test', 'Technical Interview', 'HR Interview', 'Managerial Interview', 'Group Discussion', 'Other'],
    },
    scheduledDate: { type: Date },
    scheduledTime: { type: String },
    duration: { type: Number }, // in minutes
    location: { type: String },
    meetingLink: { type: String },
    interviewer: { type: String },
    status: {
      type: String,
      enum: ['SCHEDULED', 'COMPLETED', 'PASSED', 'FAILED', 'CANCELLED'],
      default: 'SCHEDULED',
    },
    feedback: { type: String },
    score: { type: Number },
    maxScore: { type: Number },
    remarks: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Interview', interviewSchema);
