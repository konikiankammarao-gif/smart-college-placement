const express = require('express');
const router = express.Router();
const {
  applyForDrive, getApplications, getApplication, updateApplicationStatus, withdrawApplication
} = require('../controllers/applicationController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.post('/', authorize('STUDENT'), applyForDrive);
router.get('/', getApplications);
router.get('/:id', getApplication);
router.put('/:id/status', authorize('SUPER_ADMIN', 'PLACEMENT_OFFICER', 'COMPANY'), updateApplicationStatus);
router.put('/:id/withdraw', authorize('STUDENT'), withdrawApplication);

module.exports = router;
