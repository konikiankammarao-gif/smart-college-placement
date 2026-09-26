const express = require('express');
const router = express.Router();
const { getReportSummary, exportPlacementsCSV } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect, authorize('SUPER_ADMIN', 'PLACEMENT_OFFICER'));

router.get('/summary', getReportSummary);
router.get('/export-csv', exportPlacementsCSV);

module.exports = router;
