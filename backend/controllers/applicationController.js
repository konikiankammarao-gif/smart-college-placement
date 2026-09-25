const Application = require('../models/Application');
const PlacementDrive = require('../models/PlacementDrive');
const Student = require('../models/Student');
const Placement = require('../models/Placement');
const Company = require('../models/Company');
const { checkEligibility } = require('../services/eligibilityService');
const { notifyApplicationStatus } = require('../services/notificationService');
const { createAuditLog } = require('../services/auditService');

// @desc    Apply for a drive
// @route   POST /api/applications
// @access  Private (Student)
const applyForDrive = async (req, res, next) => {
  try {
    const { driveId, coverLetter } = req.body;

    const drive = await PlacementDrive.findById(driveId).populate('eligibleDepartments');
    if (!drive) return res.status(404).json({ success: false, message: 'Drive not found' });

    if (drive.status !== 'OPEN') {
      return res.status(400).json({ success: false, message: 'Drive is not accepting applications' });
    }

    if (drive.applicationDeadline && new Date() > drive.applicationDeadline) {
      return res.status(400).json({ success: false, message: 'Application deadline has passed' });
    }

    const student = await Student.findOne({ userId: req.user._id });
    if (!student) return res.status(404).json({ success: false, message: 'Student profile not found' });

    // Check eligibility
    const eligibility = checkEligibility(student, drive);
    if (!eligibility.isEligible) {
      return res.status(403).json({ success: false, message: eligibility.summary });
    }

    // Check for duplicate application
    const existing = await Application.findOne({ driveId, studentId: student._id });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already applied for this drive' });
    }

    const application = await Application.create({
      driveId,
      studentId: student._id,
      coverLetter,
      resumeSnapshot: student.resume,
      statusHistory: [{ status: 'APPLIED', updatedBy: req.user._id }],
    });

    // Update drive stats
    await PlacementDrive.findByIdAndUpdate(driveId, { $inc: { totalApplications: 1 } });

    await createAuditLog({
      userId: req.user._id,
      action: 'APPLICATION_SUBMITTED',
      entity: 'Application',
      entityId: application._id,
      description: `Application submitted for drive: ${drive.jobTitle}`,
      req,
    });

    res.status(201).json({ success: true, message: 'Application submitted successfully', data: application });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'You have already applied for this drive' });
    }
    next(error);
  }
};

// @desc    Get all applications
// @route   GET /api/applications
// @access  Private
const getApplications = async (req, res, next) => {
  try {
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      const demoApps = [
        {
          _id: '665000000000000000000050',
          drive: { roleTitle: 'Associate Software Engineer', company: { name: 'Google Cloud' }, packageDetails: { ctc: 18.5 } },
          student: { user: { name: 'Rahul Sharma' }, name: 'Rahul Sharma', rollNumber: '21CS042', department: { code: 'CSE' } },
          status: 'SHORTLISTED',
          remarks: 'Round 1 technical interview scheduled on Monday 10:00 AM',
          createdAt: new Date().toISOString()
        },
        {
          _id: '665000000000000000000051',
          drive: { roleTitle: 'Full Stack Developer', company: { name: 'Microsoft' }, packageDetails: { ctc: 24.0 } },
          student: { user: { name: 'Rahul Sharma' }, name: 'Rahul Sharma', rollNumber: '21CS042', department: { code: 'CSE' } },
          status: 'APPLIED',
          remarks: 'Resume under review by campus hiring team',
          createdAt: new Date().toISOString()
        }
      ];
      return res.json({ success: true, data: demoApps, pagination: { page: 1, limit: 20, total: 2, pages: 1 } });
    }
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const filter = {};

    if (req.query.status) filter.status = req.query.status;
    if (req.query.driveId) filter.driveId = req.query.driveId;

    // Students only see their own applications
    if (req.user.role === 'STUDENT') {
      const student = await Student.findOne({ userId: req.user._id });
      if (student) filter.studentId = student._id;
    }

    // Company only sees applications for their drives
    if (req.user.role === 'COMPANY') {
      const company = await Company.findOne({ userId: req.user._id });
      if (company) {
        const drives = await PlacementDrive.find({ companyId: company._id }).select('_id');
        filter.driveId = { $in: drives.map((d) => d._id) };
      }
    }

    const total = await Application.countDocuments(filter);
    const applications = await Application.find(filter)
      .populate({ path: 'driveId', populate: { path: 'companyId', select: 'companyName logo' }, select: 'jobTitle jobType location package status applicationDeadline' })
      .populate({ path: 'studentId', populate: { path: 'userId', select: 'name email phone' }, select: 'rollNumber cgpa department' })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.json({ success: true, data: applications, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single application
// @route   GET /api/applications/:id
// @access  Private
const getApplication = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate({ path: 'driveId', populate: { path: 'companyId', select: 'companyName logo industry' } })
      .populate({ path: 'studentId', populate: { path: 'userId', select: 'name email phone profileImage' }, populate: { path: 'department', select: 'name code' } });

    if (!application) return res.status(404).json({ success: false, message: 'Application not found' });
    res.json({ success: true, data: application });
  } catch (error) {
    next(error);
  }
};

// @desc    Update application status
// @route   PUT /api/applications/:id/status
// @access  Private (Officer, Company, Admin)
const updateApplicationStatus = async (req, res, next) => {
  try {
    const { status, remarks } = req.body;

    const validStatuses = ['APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW', 'SELECTED', 'REJECTED', 'WITHDRAWN'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const application = await Application.findById(req.params.id)
      .populate({ path: 'studentId', populate: { path: 'userId', select: 'name' } })
      .populate({ path: 'driveId', populate: { path: 'companyId', select: 'companyName' } });

    if (!application) return res.status(404).json({ success: false, message: 'Application not found' });

    const previousStatus = application.status;
    application.status = status;
    application.statusHistory.push({ status, updatedBy: req.user._id, remarks });
    await application.save();

    // Handle SELECTED status
    if (status === 'SELECTED' && previousStatus !== 'SELECTED') {
      const student = await Student.findById(application.studentId._id);
      const drive = await PlacementDrive.findById(application.driveId._id);

      // Update student placement status
      student.placementStatus = 'PLACED';
      await student.save();

      // Create placement record
      await Placement.create({
        studentId: student._id,
        applicationId: application._id,
        driveId: application.driveId._id,
        companyId: drive ? drive.companyId : null,
        jobTitle: drive ? drive.jobTitle : '',
        package: drive ? drive.package.ctc : null,
        location: drive ? drive.location : '',
        academicYear: student.batch,
      });

      // Update drive total selected
      await PlacementDrive.findByIdAndUpdate(application.driveId._id, { $inc: { totalSelected: 1 } });
    }

    // Notify student
    try {
      const studentUserId = application.studentId.userId._id || application.studentId.userId;
      const driveName = application.driveId.companyId
        ? `${application.driveId.companyId.companyName} - ${application.driveId.jobTitle}`
        : 'Placement Drive';
      await notifyApplicationStatus(studentUserId, application._id, status, driveName);
    } catch (err) {
      console.error('Notification error:', err.message);
    }

    await createAuditLog({
      userId: req.user._id,
      action: `APPLICATION_${status}`,
      entity: 'Application',
      entityId: application._id,
      description: `Application status updated to ${status}`,
      req,
    });

    res.json({ success: true, message: `Application ${status.toLowerCase()}`, data: application });
  } catch (error) {
    next(error);
  }
};

// @desc    Withdraw application
// @route   PUT /api/applications/:id/withdraw
// @access  Private (Student)
const withdrawApplication = async (req, res, next) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });
    const application = await Application.findOne({ _id: req.params.id, studentId: student._id });

    if (!application) return res.status(404).json({ success: false, message: 'Application not found' });

    if (['SELECTED', 'REJECTED', 'WITHDRAWN'].includes(application.status)) {
      return res.status(400).json({ success: false, message: 'Cannot withdraw this application' });
    }

    application.status = 'WITHDRAWN';
    application.statusHistory.push({ status: 'WITHDRAWN', updatedBy: req.user._id });
    await application.save();

    res.json({ success: true, message: 'Application withdrawn', data: application });
  } catch (error) {
    next(error);
  }
};

module.exports = { applyForDrive, getApplications, getApplication, updateApplicationStatus, withdrawApplication };
