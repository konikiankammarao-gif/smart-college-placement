const mongoose = require('mongoose');

const placementDriveSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    jobTitle: { type: String, required: true, trim: true },
    jobDescription: { type: String, required: true },
    jobType: {
      type: String,
      enum: ['Full Time', 'Internship', 'Part Time', 'Contract'],
      default: 'Full Time',
    },
    location: { type: String },
    workMode: {
      type: String,
      enum: ['On-site', 'Remote', 'Hybrid'],
      default: 'On-site',
    },
    package: {
      ctc: { type: Number }, // in LPA
      breakup: { type: String },
    },
    // Eligibility Criteria
    minimumCGPA: { type: Number, default: 0 },
    maximumBacklogs: { type: Number, default: 0 },
    allowPreviousBacklogs: { type: Boolean, default: false },
    minimum10thPercentage: { type: Number, default: 0 },
    minimum12thPercentage: { type: Number, default: 0 },
    eligibleDepartments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Department' }],
    eligibleBatches: [{ type: String }],
    requiredSkills: [{ type: String }],
    // Dates
    applicationStartDate: { type: Date },
    applicationDeadline: { type: Date },
    driveDate: { type: Date },
    // Status
    status: {
      type: String,
      enum: ['DRAFT', 'OPEN', 'CLOSED', 'COMPLETED'],
      default: 'DRAFT',
    },
    numberOfOpenings: { type: Number, default: 1 },
    // Stats
    totalApplications: { type: Number, default: 0 },
    totalSelected: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PlacementDrive', placementDriveSchema);
