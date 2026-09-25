const express = require('express');
const router = express.Router();
const Placement = require('../models/Placement');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.get('/', async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.academicYear) filter.academicYear = req.query.academicYear;

    const placements = await Placement.find(filter)
      .populate({ path: 'studentId', populate: { path: 'userId', select: 'name email' }, select: 'rollNumber cgpa department' })
      .populate('companyId', 'companyName logo industry')
      .populate({ path: 'driveId', select: 'jobTitle jobType location' })
      .sort({ placementDate: -1 });

    res.json({ success: true, data: placements, count: placements.length });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
