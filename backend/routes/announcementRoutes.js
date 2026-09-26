const express = require('express');
const router = express.Router();
const {
  createAnnouncement,
  getAnnouncements,
  deleteAnnouncement,
} = require('../controllers/announcementController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.get('/', getAnnouncements);
router.post('/', authorize('SUPER_ADMIN', 'PLACEMENT_OFFICER'), createAnnouncement);
router.delete('/:id', authorize('SUPER_ADMIN', 'PLACEMENT_OFFICER'), deleteAnnouncement);

module.exports = router;
