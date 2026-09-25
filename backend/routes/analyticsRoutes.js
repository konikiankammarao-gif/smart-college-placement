const express = require('express');
const router = express.Router();
const { getOverview, getDepartmentStats, getCompanyStats, getMonthlyTrends, getApplicationStats } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect, authorize('SUPER_ADMIN', 'PLACEMENT_OFFICER'));

router.get('/overview', getOverview);
router.get('/dashboard', getOverview);
router.get('/department-stats', getDepartmentStats);
router.get('/company-stats', getCompanyStats);
router.get('/monthly-trends', getMonthlyTrends);
router.get('/application-stats', getApplicationStats);

module.exports = router;
