const Student = require('../models/Student');
const Placement = require('../models/Placement');
const Company = require('../models/Company');
const PlacementDrive = require('../models/PlacementDrive');
const Department = require('../models/Department');

// @desc    Generate comprehensive placement reports
// @route   GET /api/reports/summary
// @access  Private (Officer, Admin)
const getReportSummary = async (req, res, next) => {
  try {
    const totalStudents = await Student.countDocuments();
    const placedStudents = await Student.countDocuments({ placementStatus: 'PLACED' });
    const totalCompanies = await Company.countDocuments({ approvalStatus: 'APPROVED' });
    const totalDrives = await PlacementDrive.countDocuments();
    const placements = await Placement.find().populate('companyId', 'companyName');

    const totalPackages = placements.map((p) => p.package || 0).filter((pkg) => pkg > 0);
    const highestPackage = totalPackages.length ? Math.max(...totalPackages) : 0;
    const lowestPackage = totalPackages.length ? Math.min(...totalPackages) : 0;
    const avgPackage = totalPackages.length
      ? (totalPackages.reduce((a, b) => a + b, 0) / totalPackages.length).toFixed(2)
      : 0;

    // Sort to compute median package
    const sortedPackages = [...totalPackages].sort((a, b) => a - b);
    let medianPackage = 0;
    if (sortedPackages.length > 0) {
      const mid = Math.floor(sortedPackages.length / 2);
      medianPackage = sortedPackages.length % 2 !== 0
        ? sortedPackages[mid]
        : ((sortedPackages[mid - 1] + sortedPackages[mid]) / 2).toFixed(2);
    }

    const placementRate = totalStudents > 0 ? ((placedStudents / totalStudents) * 100).toFixed(1) : 0;

    // Department breakdown
    const departments = await Department.find({ isActive: true });
    const departmentStats = [];
    for (const dept of departments) {
      const deptTotal = await Student.countDocuments({ department: dept._id });
      const deptPlaced = await Student.countDocuments({ department: dept._id, placementStatus: 'PLACED' });
      departmentStats.push({
        department: dept.name,
        code: dept.code,
        totalStudents: deptTotal,
        placedStudents: deptPlaced,
        placementRate: deptTotal > 0 ? ((deptPlaced / deptTotal) * 100).toFixed(1) : 0,
      });
    }

    res.json({
      success: true,
      data: {
        totalStudents,
        placedStudents,
        unplacedStudents: totalStudents - placedStudents,
        placementRate: Number(placementRate),
        totalCompanies,
        totalDrives,
        totalOffers: placements.length,
        highestPackage,
        lowestPackage,
        averagePackage: Number(avgPackage),
        medianPackage: Number(medianPackage),
        departmentStats,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Export placement report as CSV
// @route   GET /api/reports/export-csv
// @access  Private (Officer, Admin)
const exportPlacementsCSV = async (req, res, next) => {
  try {
    const placements = await Placement.find()
      .populate({
        path: 'studentId',
        populate: [
          { path: 'userId', select: 'name email phone' },
          { path: 'department', select: 'code name' },
        ],
      })
      .populate('companyId', 'companyName')
      .sort({ placementDate: -1 });

    const csvHeaders = 'Student Name,Roll Number,Email,Phone,Department,Company,Role,Package (LPA),Placement Date\n';
    const csvRows = placements.map((p) => {
      const s = p.studentId || {};
      const u = s.userId || {};
      const d = s.department || {};
      const c = p.companyId || {};

      const name = (u.name || 'N/A').replace(/,/g, ' ');
      const roll = (s.rollNumber || 'N/A').replace(/,/g, ' ');
      const email = (u.email || 'N/A').replace(/,/g, ' ');
      const phone = (u.phone || 'N/A').replace(/,/g, ' ');
      const dept = (d.code || 'N/A').replace(/,/g, ' ');
      const company = (c.companyName || 'N/A').replace(/,/g, ' ');
      const role = (p.jobTitle || 'N/A').replace(/,/g, ' ');
      const ctc = p.package || 0;
      const date = p.placementDate ? new Date(p.placementDate).toISOString().split('T')[0] : 'N/A';

      return `"${name}","${roll}","${email}","${phone}","${dept}","${company}","${role}",${ctc},"${date}"`;
    });

    const csvContent = csvHeaders + csvRows.join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="campus_placement_report.csv"');
    res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getReportSummary,
  exportPlacementsCSV,
};
