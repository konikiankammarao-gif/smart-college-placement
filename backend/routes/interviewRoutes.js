const express = require('express');
const router = express.Router();
const { createInterview, getInterviews, updateInterview } = require('../controllers/interviewController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.post('/', authorize('SUPER_ADMIN', 'PLACEMENT_OFFICER', 'COMPANY'), createInterview);
router.get('/', getInterviews);
router.put('/:id', authorize('SUPER_ADMIN', 'PLACEMENT_OFFICER', 'COMPANY'), updateInterview);

module.exports = router;
