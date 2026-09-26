const Interview = require('../models/Interview');
const Application = require('../models/Application');
const Student = require('../models/Student');
const Company = require('../models/Company');
const PlacementDrive = require('../models/PlacementDrive');
const { createNotification } = require('../services/notificationService');

// @desc    Create interview
// @route   POST /api/interviews
// @access  Private (Officer, Company, Admin)
const createInterview = async (req, res, next) => {
  try {
    const { applicationId, roundName, roundType, roundNumber, scheduledDate, scheduledTime, duration, location, meetingLink, interviewer } = req.body;

    const application = await Application.findById(applicationId)
      .populate({ path: 'studentId', populate: { path: 'userId', select: 'name _id' } })
      .populate('driveId');

    if (!application) return res.status(404).json({ success: false, message: 'Application not found' });

    const interview = await Interview.create({
      applicationId,
      driveId: application.driveId._id,
      studentId: application.studentId._id,
      roundNumber,
      roundName,
      roundType,
      scheduledDate,
      scheduledTime,
      duration,
      location,
      meetingLink,
      interviewer,
      createdBy: req.user._id,
    });

    // Update application status to INTERVIEW
    if (application.status === 'SHORTLISTED' || application.status === 'APPLIED') {
      application.status = 'INTERVIEW';
      application.statusHistory.push({ status: 'INTERVIEW', updatedBy: req.user._id, remarks: `Interview scheduled: ${roundName}` });
      await application.save();
    }

    // Notify student
    try {
      const studentUserId = application.studentId.userId._id || application.studentId.userId;
      await createNotification({
        recipient: studentUserId,
        title: 'Interview Scheduled',
        message: `Your interview for ${roundName} has been scheduled on ${new Date(scheduledDate).toDateString()}`,
        type: 'INTERVIEW_SCHEDULED',
        relatedId: interview._id,
        relatedModel: 'Interview',
      });
    } catch (err) {
      console.error('Notification error:', err.message);
    }

    res.status(201).json({ success: true, message: 'Interview scheduled', data: interview });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all interviews
// @route   GET /api/interviews
// @access  Private
const getInterviews = async (req, res, next) => {
  try {
    const filter = {};

    if (req.query.driveId) filter.driveId = req.query.driveId;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.applicationId) filter.applicationId = req.query.applicationId;

    // Student only sees their interviews
    if (req.user.role === 'STUDENT') {
      const student = await Student.findOne({ userId: req.user._id });
      if (student) filter.studentId = student._id;
    }

    // Company only sees interviews for their drives
    if (req.user.role === 'COMPANY') {
      const company = await Company.findOne({ userId: req.user._id });
      if (company) {
        const drives = await PlacementDrive.find({ companyId: company._id }).select('_id');
        filter.driveId = { $in: drives.map((d) => d._id) };
      }
    }

    const interviews = await Interview.find(filter)
      .populate({ path: 'applicationId', select: 'status' })
      .populate({ path: 'studentId', populate: { path: 'userId', select: 'name email' } })
      .populate({ path: 'driveId', populate: { path: 'companyId', select: 'companyName' }, select: 'jobTitle' })
      .sort({ scheduledDate: 1 });

    res.json({ success: true, data: interviews });
  } catch (error) {
    next(error);
  }
};

// @desc    Update interview
// @route   PUT /api/interviews/:id
// @access  Private (Officer, Company, Admin)
const updateInterview = async (req, res, next) => {
  try {
    const interview = await Interview.findById(req.params.id)
      .populate({ path: 'studentId', populate: { path: 'userId', select: 'name _id' } })
      .populate({ path: 'driveId', select: 'jobTitle' });

    if (!interview) return res.status(404).json({ success: false, message: 'Interview not found' });

    const prevStatus = interview.status;
    Object.assign(interview, req.body);
    await interview.save();

    // If status changed or date rescheduled, notify student
    if (req.body.status && req.body.status !== prevStatus) {
      try {
        const studentUserId = interview.studentId?.userId?._id || interview.studentId?.userId;
        if (studentUserId) {
          await createNotification({
            recipient: studentUserId,
            title: `Interview Round Update: ${interview.roundName}`,
            message: `Your interview status for ${interview.roundName} is now ${req.body.status}. Feedback: ${req.body.feedback || 'None'}`,
            type: 'INTERVIEW_SCHEDULED',
            relatedId: interview._id,
            relatedModel: 'Interview',
          });
        }
      } catch (err) {
        console.error('Interview update notification error:', err.message);
      }
    }

    const { createAuditLog } = require('../services/auditService');
    await createAuditLog({
      userId: req.user._id,
      action: `INTERVIEW_${req.body.status || 'UPDATED'}`,
      entity: 'Interview',
      entityId: interview._id,
      description: `Interview round ${interview.roundName} updated to status: ${interview.status}`,
      req,
    });

    res.json({ success: true, message: 'Interview updated', data: interview });
  } catch (error) {
    next(error);
  }
};

module.exports = { createInterview, getInterviews, updateInterview };

