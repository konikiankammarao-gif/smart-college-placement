const PlacementDrive = require('../models/PlacementDrive');
const Company = require('../models/Company');
const Student = require('../models/Student');
const { getEligibleStudents } = require('../services/eligibilityService');
const { createAuditLog } = require('../services/auditService');
const { notifyNewDrive } = require('../services/notificationService');

// @desc    Create placement drive
// @route   POST /api/drives
// @access  Private (Officer, Company)
const createDrive = async (req, res, next) => {
  try {
    let companyId;

    if (req.user.role === 'COMPANY') {
      const company = await Company.findOne({ userId: req.user._id });
      if (!company || company.approvalStatus !== 'APPROVED') {
        return res.status(403).json({ success: false, message: 'Company must be approved to create drives' });
      }
      companyId = company._id;
    } else {
      companyId = req.body.companyId;
      if (!companyId) return res.status(400).json({ success: false, message: 'Company ID is required' });
    }

    const drive = await PlacementDrive.create({
      ...req.body,
      companyId,
      createdBy: req.user._id,
    });

    await createAuditLog({
      userId: req.user._id,
      action: 'DRIVE_CREATED',
      entity: 'PlacementDrive',
      entityId: drive._id,
      description: `Placement drive created: ${drive.jobTitle}`,
      req,
    });

    // Notify eligible students if drive is OPEN
    if (drive.status === 'OPEN') {
      try {
        const eligibleStudents = await getEligibleStudents(drive, Student);
        const company = await Company.findById(companyId).populate('userId', 'name');
        const companyName = company ? company.companyName : 'A company';
        const studentUserIds = eligibleStudents.map((s) => s.userId._id || s.userId);
        if (studentUserIds.length > 0) {
          await notifyNewDrive(studentUserIds, drive, companyName);
        }
      } catch (notifErr) {
        console.error('Notification error:', notifErr.message);
      }
    }

    const populatedDrive = await PlacementDrive.findById(drive._id)
      .populate('companyId', 'companyName logo industry')
      .populate('eligibleDepartments', 'name code')
      .populate('createdBy', 'name');

    res.status(201).json({ success: true, message: 'Placement drive created', data: populatedDrive });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all placement drives
// @route   GET /api/drives
// @access  Private
const getDrives = async (req, res, next) => {
  try {
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      const demoDrives = [
        { _id: '665000000000000000000010', roleTitle: 'Associate Software Engineer', jobTitle: 'Associate Software Engineer', company: { name: 'Google Cloud India' }, companyId: { companyName: 'Google Cloud India' }, jobType: 'FULL_TIME', packageDetails: { ctc: 18.5 }, package: { ctc: 18.5 }, eligibilityCriteria: { minCgpa: 7.5, maxActiveBacklogs: 0 }, workLocation: 'Bangalore, India', deadline: new Date(Date.now() + 14 * 86400000).toISOString(), status: 'OPEN', applicantsCount: 38 },
        { _id: '665000000000000000000011', roleTitle: 'Full Stack Developer', jobTitle: 'Full Stack Developer', company: { name: 'Microsoft' }, companyId: { companyName: 'Microsoft' }, jobType: 'FULL_TIME', packageDetails: { ctc: 24.0 }, package: { ctc: 24.0 }, eligibilityCriteria: { minCgpa: 8.0, maxActiveBacklogs: 0 }, workLocation: 'Hyderabad, India', deadline: new Date(Date.now() + 20 * 86400000).toISOString(), status: 'OPEN', applicantsCount: 45 },
        { _id: '665000000000000000000012', roleTitle: 'Cloud DevOps Trainee', jobTitle: 'Cloud DevOps Trainee', company: { name: 'Amazon AWS' }, companyId: { companyName: 'Amazon AWS' }, jobType: 'INTERN_PLUS_FULLTIME', packageDetails: { ctc: 14.2 }, package: { ctc: 14.2 }, eligibilityCriteria: { minCgpa: 7.0, maxActiveBacklogs: 1 }, workLocation: 'Chennai / Hybrid', deadline: new Date(Date.now() + 10 * 86400000).toISOString(), status: 'OPEN', applicantsCount: 29 },
        { _id: '665000000000000000000013', roleTitle: 'Systems Engineer', jobTitle: 'Systems Engineer', company: { name: 'Infosys Ltd' }, companyId: { companyName: 'Infosys Ltd' }, jobType: 'FULL_TIME', packageDetails: { ctc: 9.5 }, package: { ctc: 9.5 }, eligibilityCriteria: { minCgpa: 6.5, maxActiveBacklogs: 0 }, workLocation: 'Pune / Bangalore', deadline: new Date(Date.now() + 30 * 86400000).toISOString(), status: 'OPEN', applicantsCount: 62 }
      ];
      return res.json({ success: true, data: demoDrives, pagination: { page: 1, limit: 20, total: demoDrives.length, pages: 1 } });
    }
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const filter = {};

    if (req.query.status) filter.status = req.query.status;
    if (req.query.location) filter.location = { $regex: req.query.location, $options: 'i' };
    if (req.query.minPackage) filter['package.ctc'] = { $gte: parseFloat(req.query.minPackage) };
    if (req.query.department) filter.eligibleDepartments = req.query.department;
    if (req.query.jobType) filter.jobType = req.query.jobType;

    // Students only see OPEN drives
    if (req.user.role === 'STUDENT') filter.status = 'OPEN';

    // Company only sees their drives
    if (req.user.role === 'COMPANY') {
      const company = await Company.findOne({ userId: req.user._id });
      if (company) filter.companyId = company._id;
    }

    const total = await PlacementDrive.countDocuments(filter);
    const drives = await PlacementDrive.find(filter)
      .populate('companyId', 'companyName logo industry website')
      .populate('eligibleDepartments', 'name code')
      .populate('createdBy', 'name')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.json({ success: true, data: drives, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single drive
// @route   GET /api/drives/:id
// @access  Private
const getDrive = async (req, res, next) => {
  try {
    const drive = await PlacementDrive.findById(req.params.id)
      .populate('companyId', 'companyName logo industry website description headquarters hrName hrEmail hrPhone')
      .populate('eligibleDepartments', 'name code')
      .populate('createdBy', 'name');

    if (!drive) return res.status(404).json({ success: false, message: 'Placement drive not found' });

    res.json({ success: true, data: drive });
  } catch (error) {
    next(error);
  }
};

// @desc    Update drive
// @route   PUT /api/drives/:id
// @access  Private (Officer, Company, Admin)
const updateDrive = async (req, res, next) => {
  try {
    const drive = await PlacementDrive.findById(req.params.id);
    if (!drive) return res.status(404).json({ success: false, message: 'Drive not found' });

    // Company can only update their own drives
    if (req.user.role === 'COMPANY') {
      const company = await Company.findOne({ userId: req.user._id });
      if (!company || drive.companyId.toString() !== company._id.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
      }
    }

    const wasOpen = drive.status === 'OPEN';
    Object.assign(drive, req.body);
    await drive.save();

    // Notify if status changed to OPEN
    if (!wasOpen && drive.status === 'OPEN') {
      try {
        const eligibleStudents = await getEligibleStudents(drive, Student);
        const company = await Company.findById(drive.companyId);
        const companyName = company ? company.companyName : 'A company';
        const studentUserIds = eligibleStudents.map((s) => s.userId._id || s.userId);
        if (studentUserIds.length > 0) {
          await notifyNewDrive(studentUserIds, drive, companyName);
        }
      } catch (err) {
        console.error('Notification error:', err.message);
      }
    }

    await createAuditLog({
      userId: req.user._id,
      action: 'DRIVE_UPDATED',
      entity: 'PlacementDrive',
      entityId: drive._id,
      description: `Drive updated: ${drive.jobTitle}`,
      req,
    });

    res.json({ success: true, message: 'Drive updated', data: drive });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete drive
// @route   DELETE /api/drives/:id
// @access  Private (Admin, Officer)
const deleteDrive = async (req, res, next) => {
  try {
    const drive = await PlacementDrive.findByIdAndDelete(req.params.id);
    if (!drive) return res.status(404).json({ success: false, message: 'Drive not found' });
    res.json({ success: true, message: 'Drive deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get eligible students for a drive
// @route   GET /api/drives/:id/eligible-students
// @access  Private (Officer, Admin, Company)
const getEligibleStudentsForDrive = async (req, res, next) => {
  try {
    const drive = await PlacementDrive.findById(req.params.id);
    if (!drive) return res.status(404).json({ success: false, message: 'Drive not found' });

    const students = await getEligibleStudents(drive, Student);
    res.json({ success: true, data: students, count: students.length });
  } catch (error) {
    next(error);
  }
};

// @desc    Get drives stats
// @route   GET /api/drives/stats
// @access  Private (Admin, Officer)
const getDriveStats = async (req, res, next) => {
  try {
    const total = await PlacementDrive.countDocuments();
    const open = await PlacementDrive.countDocuments({ status: 'OPEN' });
    const closed = await PlacementDrive.countDocuments({ status: 'CLOSED' });
    const completed = await PlacementDrive.countDocuments({ status: 'COMPLETED' });

    res.json({ success: true, data: { total, open, closed, completed } });
  } catch (error) {
    next(error);
  }
};

module.exports = { createDrive, getDrives, getDrive, updateDrive, deleteDrive, getEligibleStudentsForDrive, getDriveStats };
