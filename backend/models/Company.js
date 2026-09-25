const mongoose = require('mongoose');

const companySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    companyName: { type: String, required: true, trim: true },
    logo: { type: String, default: null },
    industry: { type: String },
    website: { type: String },
    description: { type: String },
    headquarters: { type: String },
    companySize: {
      type: String,
      enum: ['1-50', '51-200', '201-500', '501-1000', '1001-5000', '5000+'],
    },
    hrName: { type: String },
    hrEmail: { type: String },
    hrPhone: { type: String },
    approvalStatus: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING',
    },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedAt: Date,
    rejectionReason: String,
    socialLinks: {
      linkedin: String,
      twitter: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Company', companySchema);
