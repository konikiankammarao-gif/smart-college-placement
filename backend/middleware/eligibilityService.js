/**
 * Eligibility Service
 * Determines if a student is eligible for a placement drive
 */

const checkEligibility = (student, drive, departmentId) => {
  const reasons = [];
  const failReasons = [];

  // CGPA check
  if (drive.minimumCGPA > 0) {
    if (student.cgpa >= drive.minimumCGPA) {
      reasons.push(`CGPA ${student.cgpa} meets minimum ${drive.minimumCGPA}`);
    } else {
      failReasons.push(`CGPA ${student.cgpa} is below minimum required ${drive.minimumCGPA}`);
    }
  }

  // Active backlogs check
  if (student.activeBacklogs > drive.maximumBacklogs) {
    failReasons.push(`Active backlogs (${student.activeBacklogs}) exceed maximum allowed (${drive.maximumBacklogs})`);
  } else {
    if (drive.maximumBacklogs >= 0) {
      reasons.push(`Active backlogs (${student.activeBacklogs}) within allowed limit (${drive.maximumBacklogs})`);
    }
  }

  // Previous backlogs check
  if (!drive.allowPreviousBacklogs && student.previousBacklogs > 0) {
    failReasons.push(`Previous backlogs not allowed for this drive`);
  }

  // 10th percentage check
  if (drive.minimum10thPercentage > 0) {
    if (student.tenthPercentage >= drive.minimum10thPercentage) {
      reasons.push(`10th percentage ${student.tenthPercentage}% meets minimum ${drive.minimum10thPercentage}%`);
    } else {
      failReasons.push(`10th percentage ${student.tenthPercentage}% is below minimum required ${drive.minimum10thPercentage}%`);
    }
  }

  // 12th percentage check
  if (drive.minimum12thPercentage > 0) {
    if (student.twelfthPercentage >= drive.minimum12thPercentage) {
      reasons.push(`12th percentage ${student.twelfthPercentage}% meets minimum ${drive.minimum12thPercentage}%`);
    } else {
      failReasons.push(`12th percentage ${student.twelfthPercentage}% is below minimum required ${drive.minimum12thPercentage}%`);
    }
  }

  // Department check
  if (drive.eligibleDepartments && drive.eligibleDepartments.length > 0) {
    const studentDeptId = student.department ? student.department.toString() : null;
    const eligibleDeptIds = drive.eligibleDepartments.map((d) => d.toString());
    if (studentDeptId && eligibleDeptIds.includes(studentDeptId)) {
      reasons.push(`Department is eligible for this drive`);
    } else {
      failReasons.push(`Department is not eligible for this drive`);
    }
  }

  // Batch check
  if (drive.eligibleBatches && drive.eligibleBatches.length > 0) {
    if (student.batch && drive.eligibleBatches.includes(student.batch)) {
      reasons.push(`Batch ${student.batch} is eligible`);
    } else {
      failReasons.push(`Batch ${student.batch} is not eligible for this drive`);
    }
  }

  const isEligible = failReasons.length === 0;

  return {
    isEligible,
    reasons,
    failReasons,
    summary: isEligible
      ? `Eligible: ${reasons.join('. ')}`
      : `Not eligible: ${failReasons.join('. ')}`,
  };
};

/**
 * Get all eligible students for a drive
 */
const getEligibleStudents = async (drive, Student) => {
  const query = {};

  if (drive.minimumCGPA > 0) query.cgpa = { $gte: drive.minimumCGPA };
  if (drive.maximumBacklogs >= 0) query.activeBacklogs = { $lte: drive.maximumBacklogs };
  if (!drive.allowPreviousBacklogs) query.previousBacklogs = 0;
  if (drive.minimum10thPercentage > 0) query.tenthPercentage = { $gte: drive.minimum10thPercentage };
  if (drive.minimum12thPercentage > 0) query.twelfthPercentage = { $gte: drive.minimum12thPercentage };
  if (drive.eligibleDepartments && drive.eligibleDepartments.length > 0) {
    query.department = { $in: drive.eligibleDepartments };
  }
  if (drive.eligibleBatches && drive.eligibleBatches.length > 0) {
    query.batch = { $in: drive.eligibleBatches };
  }
  query.placementStatus = { $ne: 'PLACED' };

  const students = await Student.find(query)
    .populate('userId', 'name email phone')
    .populate('department', 'name code');

  return students;
};

module.exports = { checkEligibility, getEligibleStudents };
