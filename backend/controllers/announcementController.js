const Announcement = require('../models/Announcement');
const Student = require('../models/Student');
const Company = require('../models/Company');
const User = require('../models/User');
const { createNotification } = require('../services/notificationService');
const { createAuditLog } = require('../services/auditService');

// @desc    Create announcement
// @route   POST /api/announcements
// @access  Private (Officer, Admin)
const createAnnouncement = async (req, res, next) => {
  try {
    const { title, content, targetType, targetValue, priority, expiresAt } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and content are required' });
    }

    const announcement = await Announcement.create({
      title,
      content,
      targetType: targetType || 'ALL_USERS',
      targetValue: targetValue || '',
      priority: priority || 'NORMAL',
      expiresAt: expiresAt || null,
      createdBy: req.user._id,
    });

    // Notify targeted users asynchronously
    try {
      let recipientQuery = {};
      if (targetType === 'ALL_STUDENTS') {
        recipientQuery = { role: 'STUDENT' };
      } else if (targetType === 'ALL_RECRUITERS') {
        recipientQuery = { role: 'COMPANY' };
      } else if (targetType === 'ALL_OFFICERS') {
        recipientQuery = { role: 'PLACEMENT_OFFICER' };
      } else if (targetType === 'ALL_USERS') {
        recipientQuery = {};
      }

      const usersToNotify = await User.find(recipientQuery).select('_id');
      for (const u of usersToNotify.slice(0, 100)) {
        createNotification({
          recipient: u._id,
          title: `Announcement: ${title}`,
          message: content.length > 90 ? content.substring(0, 87) + '...' : content,
          type: 'ANNOUNCEMENT',
          relatedId: announcement._id,
          relatedModel: 'Announcement',
        }).catch(() => {});
      }
    } catch (notifErr) {
      console.error('Failed to dispatch announcement notifications:', notifErr.message);
    }

    await createAuditLog({
      userId: req.user._id,
      action: 'ANNOUNCEMENT_CREATED',
      entity: 'Announcement',
      entityId: announcement._id,
      description: `Announcement created: ${title} (${targetType})`,
      req,
    });

    const populated = await Announcement.findById(announcement._id).populate('createdBy', 'name role');
    res.status(201).json({ success: true, message: 'Announcement published', data: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Get announcements visible to current user
// @route   GET /api/announcements
// @access  Private
const getAnnouncements = async (req, res, next) => {
  try {
    const role = req.user.role;
    let filter = {};

    if (role === 'SUPER_ADMIN' || role === 'PLACEMENT_OFFICER') {
      // Admins and officers can see all announcements
      filter = {};
    } else if (role === 'STUDENT') {
      const student = await Student.findOne({ userId: req.user._id });
      const deptId = student?.department?.toString();
      const batch = student?.batch;

      filter = {
        $or: [
          { targetType: 'ALL_USERS' },
          { targetType: 'ALL_STUDENTS' },
          ...(deptId ? [{ targetType: 'SPECIFIC_DEPARTMENT', targetValue: deptId }] : []),
          ...(batch ? [{ targetType: 'SPECIFIC_BATCH', targetValue: batch }] : []),
        ],
      };
    } else if (role === 'COMPANY') {
      const company = await Company.findOne({ userId: req.user._id });
      filter = {
        $or: [
          { targetType: 'ALL_USERS' },
          { targetType: 'ALL_RECRUITERS' },
          ...(company ? [{ targetType: 'SPECIFIC_COMPANY', targetValue: company._id.toString() }] : []),
        ],
      };
    }

    const announcements = await Announcement.find(filter)
      .populate('createdBy', 'name role')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: announcements });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete announcement
// @route   DELETE /api/announcements/:id
// @access  Private (Officer, Admin)
const deleteAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }

    if (
      req.user.role !== 'SUPER_ADMIN' &&
      announcement.createdBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this announcement' });
    }

    await Announcement.findByIdAndDelete(req.params.id);

    await createAuditLog({
      userId: req.user._id,
      action: 'ANNOUNCEMENT_DELETED',
      entity: 'Announcement',
      entityId: req.params.id,
      description: `Announcement deleted: ${announcement.title}`,
      req,
    });

    res.json({ success: true, message: 'Announcement removed' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAnnouncement,
  getAnnouncements,
  deleteAnnouncement,
};
