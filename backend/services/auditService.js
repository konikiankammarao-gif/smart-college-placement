const AuditLog = require('../models/AuditLog');

const createAuditLog = async ({ userId, action, entity, entityId, description, req, metadata }) => {
  try {
    const ipAddress = req
      ? req.headers['x-forwarded-for'] || req.connection.remoteAddress
      : null;
    const userAgent = req ? req.headers['user-agent'] : null;

    await AuditLog.create({
      userId,
      action,
      entity,
      entityId,
      description,
      ipAddress,
      userAgent,
      metadata,
    });
  } catch (error) {
    console.error('Audit log error:', error);
  }
};

module.exports = { createAuditLog };
