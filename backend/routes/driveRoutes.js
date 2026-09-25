const express = require('express');
const router = express.Router();
const {
  createDrive, getDrives, getDrive, updateDrive, deleteDrive, getEligibleStudentsForDrive, getDriveStats
} = require('../controllers/driveController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.get('/stats', authorize('SUPER_ADMIN', 'PLACEMENT_OFFICER'), getDriveStats);
router.post('/', authorize('SUPER_ADMIN', 'PLACEMENT_OFFICER', 'COMPANY'), createDrive);
router.get('/', getDrives);
router.get('/:id', getDrive);
router.put('/:id', authorize('SUPER_ADMIN', 'PLACEMENT_OFFICER', 'COMPANY'), updateDrive);
router.delete('/:id', authorize('SUPER_ADMIN', 'PLACEMENT_OFFICER'), deleteDrive);
router.get('/:id/eligible-students', authorize('SUPER_ADMIN', 'PLACEMENT_OFFICER', 'COMPANY'), getEligibleStudentsForDrive);

module.exports = router;
