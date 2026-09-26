const express = require('express');
const router = express.Router();
const {
  createTicket,
  getTickets,
  getTicketById,
  replyTicket,
  updateTicketStatus,
} = require('../controllers/supportTicketController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.get('/', getTickets);
router.post('/', createTicket);
router.get('/:id', getTicketById);
router.post('/:id/messages', replyTicket);
router.put('/:id/status', authorize('SUPER_ADMIN', 'PLACEMENT_OFFICER'), updateTicketStatus);

module.exports = router;
