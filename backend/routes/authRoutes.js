const express = require('express');
const router = express.Router();
const { register, login, getMe, changePassword, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { uploadImage } = require('../middleware/uploadMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/change-password', protect, changePassword);
router.put('/update-profile', protect, uploadImage.single('profileImage'), updateProfile);

module.exports = router;
