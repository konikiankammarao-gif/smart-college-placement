const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');
const { createNotification } = require('../services/notificationService');

// @desc    Get user conversations
// @route   GET /api/conversations
// @access  Private
const getConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id,
    })
      .populate('participants', 'name email role profileImage')
      .populate('lastMessage.senderId', 'name')
      .sort({ updatedAt: -1 });

    res.json({ success: true, data: conversations });
  } catch (error) {
    next(error);
  }
};

// @desc    Get messages for a conversation
// @route   GET /api/conversations/:id/messages
// @access  Private
const getMessages = async (req, res, next) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    if (!conversation.participants.some((p) => p.toString() === req.user._id.toString())) {
      return res.status(403).json({ success: false, message: 'Not authorized to view these messages' });
    }

    const messages = await Message.find({ conversationId: req.params.id })
      .populate('senderId', 'name email role profileImage')
      .sort({ createdAt: 1 });

    // Mark messages as read where current user is receiver
    await Message.updateMany(
      { conversationId: req.params.id, receiverId: req.user._id, isRead: false },
      { isRead: true }
    );

    res.json({ success: true, data: messages });
  } catch (error) {
    next(error);
  }
};

// @desc    Create or find conversation
// @route   POST /api/conversations
// @access  Private
const createConversation = async (req, res, next) => {
  try {
    const { receiverId, conversationType, relatedEntity, relatedEntityId } = req.body;

    if (!receiverId) {
      return res.status(400).json({ success: false, message: 'Recipient is required' });
    }

    const recipient = await User.findById(receiverId);
    if (!recipient) {
      return res.status(404).json({ success: false, message: 'Recipient user not found' });
    }

    // Check if conversation already exists between the two users
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, receiverId] },
      ...(relatedEntityId ? { relatedEntityId } : {}),
    }).populate('participants', 'name email role profileImage');

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user._id, receiverId],
        conversationType: conversationType || 'GENERAL',
        relatedEntity: relatedEntity || 'General',
        relatedEntityId: relatedEntityId || null,
      });

      conversation = await Conversation.findById(conversation._id).populate(
        'participants',
        'name email role profileImage'
      );
    }

    res.status(201).json({ success: true, data: conversation });
  } catch (error) {
    next(error);
  }
};

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
const sendMessage = async (req, res, next) => {
  try {
    const { conversationId, receiverId, message, attachments } = req.body;

    if (!conversationId || !message) {
      return res.status(400).json({ success: false, message: 'Conversation ID and message are required' });
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    if (!conversation.participants.some((p) => p.toString() === req.user._id.toString())) {
      return res.status(403).json({ success: false, message: 'Not authorized to send messages in this conversation' });
    }

    const targetReceiverId =
      receiverId || conversation.participants.find((p) => p.toString() !== req.user._id.toString());

    const newMessage = await Message.create({
      conversationId,
      senderId: req.user._id,
      receiverId: targetReceiverId,
      message,
      attachments: attachments || [],
    });

    // Update conversation lastMessage & timestamp
    conversation.lastMessage = {
      message: message.substring(0, 100),
      senderId: req.user._id,
      createdAt: new Date(),
    };
    await conversation.save();

    // Trigger notification for the receiver
    if (targetReceiverId) {
      try {
        await createNotification({
          recipient: targetReceiverId,
          title: `New message from ${req.user.name}`,
          message: message.length > 80 ? message.substring(0, 77) + '...' : message,
          type: 'GENERAL',
          relatedId: conversation._id,
          relatedModel: 'Conversation',
        });
      } catch (err) {
        console.error('Message notification error:', err.message);
      }
    }

    const populatedMessage = await Message.findById(newMessage._id).populate(
      'senderId',
      'name email role profileImage'
    );

    res.status(201).json({ success: true, data: populatedMessage });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark message as read
// @route   PUT /api/messages/:id/read
// @access  Private
const markMessageAsRead = async (req, res, next) => {
  try {
    const message = await Message.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    res.json({ success: true, data: message });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getConversations,
  getMessages,
  createConversation,
  sendMessage,
  markMessageAsRead,
};
