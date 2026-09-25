const Student = require('../models/Student');
const User = require('../models/User');
const Application = require('../models/Application');

// @desc    Get all students
// @route   GET /api/students
// @access  Private (Admin, Officer)
const getStudents = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};

    // Search
    if (req.query.search) {
      const users = await User.find({
        name: { $regex: req.query.search, $options: 'i' },
        role: 'STUDENT',
      }).select('_id');
      const userIds = users.map((u) => u._id);
      filter.$or = [
        { userId: { $in: userIds } },
        { rollNumber: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    if (req.query.department) filter.department = req.query.department;
    if (req.query.batch) filter.batch = req.query.batch;
    if (req.query.placementStatus) filter.placementStatus = req.query.placementStatus;
    if (req.query.minCgpa) filter.cgpa = { $gte: parseFloat(req.query.minCgpa) };

    const total = await Student.countDocuments(filter);
    const students = await Student.find(filter)
      .populate('userId', 'name email phone profileImage isActive isVerified')
      .populate('department', 'name code')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: students,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single student
// @route   GET /api/students/:id
// @access  Private
const getStudent = async (req, res, next) => {
  try {
    let student;
    if (req.params.id === 'profile' || req.params.id === 'me') {
      student = await Student.findOne({ userId: req.user._id })
        .populate('userId', 'name email phone profileImage')
        .populate('department', 'name code');
    } else {
      student = await Student.findById(req.params.id)
        .populate('userId', 'name email phone profileImage')
        .populate('department', 'name code');
    }

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    res.json({ success: true, data: student });
  } catch (error) {
    next(error);
  }
};

// @desc    Get my profile (student)
// @route   GET /api/students/profile
// @access  Private (Student)
const getMyProfile = async (req, res, next) => {
  try {
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      return res.json({
        success: true,
        data: {
          _id: '665000000000000000000030',
          rollNumber: '21CS042',
          department: { name: 'Computer Science & Engineering', code: 'CSE' },
          academic: { cgpa: 8.85, tenthPercentage: 92.5, twelfthPercentage: 89.0, activeBacklogs: 0 },
          skills: ['React', 'Node.js', 'Python', 'MongoDB', 'Docker', 'Data Structures'],
          socialProfiles: { linkedin: 'https://linkedin.com', github: 'https://github.com' },
          isPlaced: false,
          isVerified: true,
          user: req.user
        }
      });
    }
    const student = await Student.findOne({ userId: req.user._id })
      .populate('userId', 'name email phone profileImage isVerified')
      .populate('department', 'name code');

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    // Calculate profile completion
    const completion = student.calculateProfileCompletion();
    student.profileCompletion = completion;
    await student.save({ validateBeforeSave: false });

    res.json({ success: true, data: student });
  } catch (error) {
    next(error);
  }
};

// @desc    Update student profile
// @route   PUT /api/students/profile
// @access  Private (Student)
const updateProfile = async (req, res, next) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    const allowedFields = [
      'rollNumber', 'registrationNumber', 'department', 'degree', 'batch', 'graduationYear',
      'dateOfBirth', 'gender', 'address', 'city', 'state',
      'tenthPercentage', 'twelfthPercentage', 'diplomaPercentage', 'cgpa',
      'activeBacklogs', 'previousBacklogs',
      'skills', 'programmingLanguages', 'webTechnologies', 'databases', 'frameworks', 'tools',
      'linkedin', 'github', 'portfolio', 'codingProfiles',
      'certifications', 'projects', 'internships', 'achievements', 'extracurricular',
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) student[field] = req.body[field];
    });

    student.profileCompletion = student.calculateProfileCompletion();
    await student.save();

    const updated = await Student.findById(student._id)
      .populate('userId', 'name email phone profileImage')
      .populate('department', 'name code');

    res.json({ success: true, message: 'Profile updated successfully', data: updated });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload resume
// @route   POST /api/students/resume
// @access  Private (Student)
const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a PDF file' });
    }

    const student = await Student.findOneAndUpdate(
      { userId: req.user._id },
      { resume: `/uploads/resumes/${req.file.filename}` },
      { new: true }
    );

    res.json({ success: true, message: 'Resume uploaded successfully', data: { resume: student.resume } });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify student (Officer/Admin)
// @route   PUT /api/students/:id/verify
// @access  Private (Officer, Admin)
const verifyStudent = async (req, res, next) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { isVerified: req.body.verified },
      { new: true }
    );
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    res.json({ success: true, message: `Student ${req.body.verified ? 'verified' : 'unverified'}`, data: student });
  } catch (error) {
    next(error);
  }
};

// @desc    Get student stats
// @route   GET /api/students/stats
// @access  Private (Officer, Admin)
const getStudentStats = async (req, res, next) => {
  try {
    const total = await Student.countDocuments();
    const placed = await Student.countDocuments({ placementStatus: 'PLACED' });
    const notPlaced = await Student.countDocuments({ placementStatus: 'NOT_PLACED' });
    const verified = await Student.countDocuments({ isVerified: true });

    const departmentStats = await Student.aggregate([
      { $lookup: { from: 'departments', localField: 'department', foreignField: '_id', as: 'dept' } },
      { $unwind: { path: '$dept', preserveNullAndEmptyArrays: true } },
      { $group: { _id: '$dept.name', total: { $sum: 1 }, placed: { $sum: { $cond: [{ $eq: ['$placementStatus', 'PLACED'] }, 1, 0] } } } },
      { $sort: { total: -1 } },
    ]);

    res.json({
      success: true,
      data: { total, placed, notPlaced, verified, placementPercentage: total > 0 ? ((placed / total) * 100).toFixed(1) : 0, departmentStats },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getStudents, getStudent, getMyProfile, updateProfile, uploadResume, verifyStudent, getStudentStats };
