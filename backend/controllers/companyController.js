const Company = require('../models/Company');
const User = require('../models/User');
const { createAuditLog } = require('../services/auditService');

// @desc    Get all companies
// @route   GET /api/companies
// @access  Private
const getCompanies = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const filter = {};

    if (req.query.search) filter.companyName = { $regex: req.query.search, $options: 'i' };
    if (req.query.industry) filter.industry = req.query.industry;
    if (req.query.approvalStatus) filter.approvalStatus = req.query.approvalStatus;

    // Students and public only see approved companies
    if (req.user.role === 'STUDENT') filter.approvalStatus = 'APPROVED';

    const total = await Company.countDocuments(filter);
    const companies = await Company.find(filter)
      .populate('userId', 'name email phone profileImage isActive')
      .populate('approvedBy', 'name')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.json({ success: true, data: companies, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single company
// @route   GET /api/companies/:id
// @access  Private
const getCompany = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id)
      .populate('userId', 'name email phone')
      .populate('approvedBy', 'name');

    if (!company) return res.status(404).json({ success: false, message: 'Company not found' });
    res.json({ success: true, data: company });
  } catch (error) {
    next(error);
  }
};

// @desc    Get my company profile
// @route   GET /api/companies/profile
// @access  Private (Company)
const getMyCompanyProfile = async (req, res, next) => {
  try {
    const company = await Company.findOne({ userId: req.user._id })
      .populate('userId', 'name email phone profileImage');

    if (!company) return res.status(404).json({ success: false, message: 'Company profile not found' });
    res.json({ success: true, data: company });
  } catch (error) {
    next(error);
  }
};

// @desc    Update company profile
// @route   PUT /api/companies/profile
// @access  Private (Company)
const updateCompanyProfile = async (req, res, next) => {
  try {
    const allowedFields = ['companyName', 'industry', 'website', 'description', 'headquarters', 'companySize', 'hrName', 'hrEmail', 'hrPhone', 'socialLinks'];
    const update = {};
    allowedFields.forEach((f) => { if (req.body[f] !== undefined) update[f] = req.body[f]; });
    if (req.file) update.logo = `/uploads/images/${req.file.filename}`;

    const company = await Company.findOneAndUpdate({ userId: req.user._id }, update, { new: true });
    res.json({ success: true, message: 'Company profile updated', data: company });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve/Reject company
// @route   PUT /api/companies/:id/approval
// @access  Private (Admin, Officer)
const updateCompanyApproval = async (req, res, next) => {
  try {
    const { status, rejectionReason } = req.body;

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid approval status' });
    }

    const company = await Company.findByIdAndUpdate(
      req.params.id,
      { approvalStatus: status, approvedBy: req.user._id, approvedAt: new Date(), rejectionReason },
      { new: true }
    ).populate('userId', 'name email');

    if (!company) return res.status(404).json({ success: false, message: 'Company not found' });

    await createAuditLog({
      userId: req.user._id,
      action: status === 'APPROVED' ? 'COMPANY_APPROVED' : 'COMPANY_REJECTED',
      entity: 'Company',
      entityId: company._id,
      description: `Company ${company.companyName} ${status.toLowerCase()} by ${req.user.name}`,
      req,
    });

    res.json({ success: true, message: `Company ${status.toLowerCase()} successfully`, data: company });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete company
// @route   DELETE /api/companies/:id
// @access  Private (Admin)
const deleteCompany = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) return res.status(404).json({ success: false, message: 'Company not found' });
    await company.deleteOne();
    // Also remove user
    await User.findByIdAndDelete(company.userId);
    res.json({ success: true, message: 'Company deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCompanies, getCompany, getMyCompanyProfile, updateCompanyProfile, updateCompanyApproval, deleteCompany };
