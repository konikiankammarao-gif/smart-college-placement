const express = require('express');
const router = express.Router();
const {
  getConversations,
  getMessages,
  createConversation,
  sendMessage,
  markMessageAsRead,
} = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

// Conversation routes
router.get('/conversations', getConversations);
router.post('/conversations', createConversation);
router.get('/conversations/:id/messages', getMessages);

// Message routes
router.post('/messages', sendMessage);
router.put('/messages/:id/read', markMessageAsRead);

module.exports = router;
