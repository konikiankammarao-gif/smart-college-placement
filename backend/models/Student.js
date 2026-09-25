const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    rollNumber: { type: String, unique: true, sparse: true, trim: true },
    registrationNumber: { type: String, unique: true, sparse: true, trim: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
    degree: { type: String, default: 'B.Tech' },
    batch: { type: String }, // e.g. "2020-2024"
    graduationYear: { type: Number },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ['Male', 'Female', 'Other', ''] },
    address: { type: String },
    city: { type: String },
    state: { type: String },
    // Academic
    tenthPercentage: { type: Number, min: 0, max: 100, default: 0 },
    twelfthPercentage: { type: Number, min: 0, max: 100, default: 0 },
    diplomaPercentage: { type: Number, min: 0, max: 100, default: 0 },
    cgpa: { type: Number, min: 0, max: 10, default: 0 },
    activeBacklogs: { type: Number, default: 0 },
    previousBacklogs: { type: Number, default: 0 },
    // Technical Skills
    skills: [{ type: String }],
    programmingLanguages: [{ type: String }],
    webTechnologies: [{ type: String }],
    databases: [{ type: String }],
    frameworks: [{ type: String }],
    tools: [{ type: String }],
    // Career
    resume: { type: String, default: null },
    linkedin: { type: String },
    github: { type: String },
    portfolio: { type: String },
    codingProfiles: {
      leetcode: String,
      hackerrank: String,
      codechef: String,
      codeforces: String,
    },
    // Additional
    certifications: [
      {
        name: String,
        issuer: String,
        issueDate: Date,
        expiryDate: Date,
        credentialId: String,
        credentialUrl: String,
      },
    ],
    projects: [
      {
        title: String,
        description: String,
        technologies: [String],
        githubLink: String,
        liveLink: String,
        startDate: Date,
        endDate: Date,
      },
    ],
    internships: [
      {
        company: String,
        role: String,
        startDate: Date,
        endDate: Date,
        description: String,
        location: String,
        stipend: Number,
      },
    ],
    achievements: [
      {
        title: String,
        description: String,
        date: Date,
      },
    ],
    extracurricular: [{ type: String }],
    // Status
    placementStatus: {
      type: String,
      enum: ['NOT_PLACED', 'PLACED', 'NOT_ELIGIBLE'],
      default: 'NOT_PLACED',
    },
    isVerified: { type: Boolean, default: false },
    profileCompletion: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Virtual for full profile completion
studentSchema.methods.calculateProfileCompletion = function () {
  let score = 0;
  const fields = [
    'rollNumber', 'department', 'batch', 'graduationYear', 'dateOfBirth',
    'gender', 'address', 'cgpa', 'tenthPercentage', 'twelfthPercentage',
    'resume', 'linkedin', 'github',
  ];
  fields.forEach((f) => { if (this[f]) score += 1; });
  if (this.skills && this.skills.length > 0) score += 1;
  if (this.projects && this.projects.length > 0) score += 1;
  return Math.round((score / (fields.length + 2)) * 100);
};

module.exports = mongoose.model('Student', studentSchema);
