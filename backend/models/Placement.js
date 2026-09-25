const mongoose = require('mongoose');

const placementSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application' },
    driveId: { type: mongoose.Schema.Types.ObjectId, ref: 'PlacementDrive' },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
    jobTitle: { type: String },
    package: { type: Number }, // in LPA
    location: { type: String },
    joiningDate: { type: Date },
    offerLetterUrl: { type: String },
    placementDate: { type: Date, default: Date.now },
    academicYear: { type: String },
    remarks: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Placement', placementSchema);
