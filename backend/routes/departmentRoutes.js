const express = require('express');
const router = express.Router();
const Department = require('../models/Department');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', async (req, res, next) => {
  try {
    const departments = await Department.find({ isActive: true }).sort({ name: 1 });
    res.json({ success: true, data: departments });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
