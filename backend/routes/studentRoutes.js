const express = require('express');
const router = express.Router();
const {
  getStudents, getStudent, getMyProfile, updateProfile, uploadResume, verifyStudent, getStudentStats
} = require('../controllers/studentController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { uploadResume: uploadResumeMiddleware } = require('../middleware/uploadMiddleware');

router.use(protect);

router.get('/stats', authorize('SUPER_ADMIN', 'PLACEMENT_OFFICER'), getStudentStats);
router.get('/profile', authorize('STUDENT'), getMyProfile);
router.put('/profile', authorize('STUDENT'), updateProfile);
router.post('/resume', authorize('STUDENT'), uploadResumeMiddleware.single('resume'), uploadResume);
router.put('/:id/verify', authorize('SUPER_ADMIN', 'PLACEMENT_OFFICER'), verifyStudent);
router.get('/', authorize('SUPER_ADMIN', 'PLACEMENT_OFFICER', 'COMPANY'), getStudents);
router.get('/:id', getStudent);

module.exports = router;
