const SupportTicket = require('../models/SupportTicket');
const { createNotification } = require('../services/notificationService');
const { createAuditLog } = require('../services/auditService');

// @desc    Create support query / ticket
// @route   POST /api/support-tickets
// @access  Private
const createTicket = async (req, res, next) => {
  try {
    const { subject, description, category, priority } = req.body;

    if (!subject || !description) {
      return res.status(400).json({ success: false, message: 'Subject and description are required' });
    }

    const ticket = await SupportTicket.create({
      subject,
      description,
      category: category || 'PLACEMENT_DRIVE',
      priority: priority || 'MEDIUM',
      createdBy: req.user._id,
      messages: [
        {
          senderId: req.user._id,
          message: description,
          createdAt: new Date(),
        },
      ],
    });

    await createAuditLog({
      userId: req.user._id,
      action: 'TICKET_CREATED',
      entity: 'SupportTicket',
      entityId: ticket._id,
      description: `Support ticket created: ${subject} (${category})`,
      req,
    });

    const populated = await SupportTicket.findById(ticket._id)
      .populate('createdBy', 'name email role')
      .populate('messages.senderId', 'name role');

    res.status(201).json({ success: true, message: 'Query ticket submitted successfully', data: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Get tickets for current user or all (for officers/admins)
// @route   GET /api/support-tickets
// @access  Private
const getTickets = async (req, res, next) => {
  try {
    const filter = {};

    if (req.user.role === 'STUDENT' || req.user.role === 'COMPANY') {
      filter.createdBy = req.user._id;
    }

    if (req.query.status) {
      filter.status = req.query.status;
    }
    if (req.query.category) {
      filter.category = req.query.category;
    }

    const tickets = await SupportTicket.find(filter)
      .populate('createdBy', 'name email role')
      .populate('assignedTo', 'name email')
      .sort({ updatedAt: -1 });

    res.json({ success: true, data: tickets });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single ticket with thread
// @route   GET /api/support-tickets/:id
// @access  Private
const getTicketById = async (req, res, next) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id)
      .populate('createdBy', 'name email role')
      .populate('assignedTo', 'name email')
      .populate('messages.senderId', 'name email role');

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    // Role check: Only creator or staff can view
    if (
      req.user.role !== 'SUPER_ADMIN' &&
      req.user.role !== 'PLACEMENT_OFFICER' &&
      ticket.createdBy._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this ticket' });
    }

    res.json({ success: true, data: ticket });
  } catch (error) {
    next(error);
  }
};

// @desc    Add reply message to ticket
// @route   POST /api/support-tickets/:id/messages
// @access  Private
const replyTicket = async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, message: 'Message text is required' });
    }

    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    ticket.messages.push({
      senderId: req.user._id,
      message,
      createdAt: new Date(),
    });

    if (req.user.role === 'PLACEMENT_OFFICER' || req.user.role === 'SUPER_ADMIN') {
      if (ticket.status === 'OPEN') {
        ticket.status = 'IN_PROGRESS';
      }
      // Notify creator
      try {
        await createNotification({
          recipient: ticket.createdBy,
          title: `Update on Ticket ${ticket.ticketId}`,
          message: `Staff replied: ${message.substring(0, 60)}...`,
          type: 'GENERAL',
          relatedId: ticket._id,
          relatedModel: 'SupportTicket',
        });
      } catch (err) {
        console.error('Ticket reply notification failed:', err.message);
      }
    }

    await ticket.save();

    const updated = await SupportTicket.findById(ticket._id)
      .populate('createdBy', 'name email role')
      .populate('messages.senderId', 'name email role');

    res.json({ success: true, message: 'Reply posted', data: updated });
  } catch (error) {
    next(error);
  }
};

// @desc    Update ticket status
// @route   PUT /api/support-tickets/:id/status
// @access  Private (Officer, Admin)
const updateTicketStatus = async (req, res, next) => {
  try {
    const { status, assignedTo } = req.body;

    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    if (status) ticket.status = status;
    if (assignedTo) ticket.assignedTo = assignedTo;

    await ticket.save();

    try {
      await createNotification({
        recipient: ticket.createdBy,
        title: `Ticket ${ticket.ticketId} marked as ${status}`,
        message: `Your query regarding "${ticket.subject}" has been updated to ${status}.`,
        type: 'GENERAL',
        relatedId: ticket._id,
        relatedModel: 'SupportTicket',
      });
    } catch (err) {
      console.error(err);
    }

    res.json({ success: true, message: `Ticket status set to ${status}`, data: ticket });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTicket,
  getTickets,
  getTicketById,
  replyTicket,
  updateTicketStatus,
};
