const Notification = require('../models/Notification');

const createNotification = async ({ recipient, title, message, type, relatedId, relatedModel }) => {
  try {
    const notification = await Notification.create({
      recipient,
      title,
      message,
      type,
      relatedId,
      relatedModel,
    });
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

const createBulkNotifications = async (notifications) => {
  try {
    const created = await Notification.insertMany(notifications);
    return created;
  } catch (error) {
    console.error('Error creating bulk notifications:', error);
  }
};

const notifyNewDrive = async (studentUserIds, drive, companyName) => {
  const notifications = studentUserIds.map((userId) => ({
    recipient: userId,
    title: 'New Placement Drive',
    message: `${companyName} has posted a new placement drive for ${drive.jobTitle}. Check your eligibility and apply!`,
    type: 'NEW_DRIVE',
    relatedId: drive._id,
    relatedModel: 'PlacementDrive',
  }));
  return createBulkNotifications(notifications);
};

const notifyApplicationStatus = async (userId, applicationId, status, driveName) => {
  const messages = {
    SHORTLISTED: `Congratulations! You've been shortlisted for ${driveName}`,
    SELECTED: `🎉 Congratulations! You've been selected by ${driveName}`,
    REJECTED: `Your application for ${driveName} has been rejected`,
    INTERVIEW: `You have an interview scheduled for ${driveName}`,
    UNDER_REVIEW: `Your application for ${driveName} is under review`,
  };

  const types = {
    SHORTLISTED: 'APPLICATION_SHORTLISTED',
    SELECTED: 'SELECTED',
    REJECTED: 'REJECTED',
    INTERVIEW: 'INTERVIEW_SCHEDULED',
    UNDER_REVIEW: 'GENERAL',
  };

  return createNotification({
    recipient: userId,
    title: `Application ${status}`,
    message: messages[status] || `Your application status has been updated to ${status}`,
    type: types[status] || 'GENERAL',
    relatedId: applicationId,
    relatedModel: 'Application',
  });
};

module.exports = {
  createNotification,
  createBulkNotifications,
  notifyNewDrive,
  notifyApplicationStatus,
};
