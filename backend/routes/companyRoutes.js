const express = require('express');
const router = express.Router();
const {
  getCompanies, getCompany, getMyCompanyProfile, updateCompanyProfile, updateCompanyApproval, deleteCompany
} = require('../controllers/companyController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { uploadImage } = require('../middleware/uploadMiddleware');

router.use(protect);

router.get('/profile', authorize('COMPANY'), getMyCompanyProfile);
router.put('/profile', authorize('COMPANY'), uploadImage.single('logo'), updateCompanyProfile);
router.put('/:id/approval', authorize('SUPER_ADMIN', 'PLACEMENT_OFFICER'), updateCompanyApproval);
router.delete('/:id', authorize('SUPER_ADMIN'), deleteCompany);
router.get('/', getCompanies);
router.get('/:id', getCompany);

module.exports = router;
