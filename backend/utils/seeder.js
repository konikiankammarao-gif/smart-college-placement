const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Student = require('../models/Student');
const Company = require('../models/Company');
const Department = require('../models/Department');
const PlacementDrive = require('../models/PlacementDrive');
const Application = require('../models/Application');
const Notification = require('../models/Notification');
const Placement = require('../models/Placement');
const Announcement = require('../models/Announcement');
const SupportTicket = require('../models/SupportTicket');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

const seed = async () => {
  await connectDB();
  console.log('🌱 Seeding database...');

  // Clean existing data
  await Promise.all([
    User.deleteMany({}),
    Student.deleteMany({}),
    Company.deleteMany({}),
    Department.deleteMany({}),
    PlacementDrive.deleteMany({}),
    Application.deleteMany({}),
    Notification.deleteMany({}),
    Placement.deleteMany({}),
    Announcement.deleteMany({}),
    SupportTicket.deleteMany({}),
    Conversation.deleteMany({}),
    Message.deleteMany({}),
  ]);
  console.log('✅ Cleared existing data');

  // Departments
  const departments = await Department.insertMany([
    { name: 'Computer Science & Engineering', code: 'CSE', hod: 'Dr. Ramesh Kumar' },
    { name: 'Information Technology', code: 'IT', hod: 'Dr. Priya Sharma' },
    { name: 'Electronics & Communication', code: 'ECE', hod: 'Dr. Suresh Rao' },
    { name: 'Mechanical Engineering', code: 'ME', hod: 'Dr. Anil Gupta' },
    { name: 'Electrical Engineering', code: 'EE', hod: 'Dr. Kavitha Nair' },
    { name: 'Civil Engineering', code: 'CE', hod: 'Dr. Rajesh Patel' },
  ]);
  console.log('✅ Departments seeded');

  // Admin
  const adminUser = await User.create({
    name: 'Super Admin',
    email: 'admin@smartplacement.com',
    password: 'Admin@123',
    role: 'SUPER_ADMIN',
    phone: '9000000000',
    isActive: true,
    isVerified: true,
  });

  // Placement Officer
  const officerUser = await User.create({
    name: 'Placement Officer',
    email: 'officer@smartplacement.com',
    password: 'Officer@123',
    role: 'PLACEMENT_OFFICER',
    phone: '9000000001',
    isActive: true,
    isVerified: true,
  });
  console.log('✅ Admin & Officer created');

  // Students
  const studentData = [
    { name: 'Arjun Sharma', email: 'arjun@student.com', phone: '9111111111', dept: 0, cgpa: 8.5, ten: 88, twelve: 85, backlogs: 0, batch: '2021-2025', year: 2025 },
    { name: 'Priya Patel', email: 'priya@student.com', phone: '9111111112', dept: 0, cgpa: 9.2, ten: 92, twelve: 90, backlogs: 0, batch: '2021-2025', year: 2025 },
    { name: 'Rahul Verma', email: 'rahul@student.com', phone: '9111111113', dept: 1, cgpa: 7.8, ten: 78, twelve: 75, backlogs: 1, batch: '2021-2025', year: 2025 },
    { name: 'Sneha Reddy', email: 'sneha@student.com', phone: '9111111114', dept: 1, cgpa: 8.9, ten: 95, twelve: 92, backlogs: 0, batch: '2021-2025', year: 2025 },
    { name: 'Vikram Singh', email: 'vikram@student.com', phone: '9111111115', dept: 2, cgpa: 7.5, ten: 80, twelve: 78, backlogs: 0, batch: '2021-2025', year: 2025 },
    { name: 'Ananya Krishnan', email: 'ananya@student.com', phone: '9111111116', dept: 0, cgpa: 9.5, ten: 97, twelve: 95, backlogs: 0, batch: '2020-2024', year: 2024 },
    { name: 'Rohit Mishra', email: 'rohit@student.com', phone: '9111111117', dept: 3, cgpa: 7.2, ten: 75, twelve: 72, backlogs: 2, batch: '2021-2025', year: 2025 },
    { name: 'Divya Menon', email: 'divya@student.com', phone: '9111111118', dept: 1, cgpa: 8.1, ten: 85, twelve: 82, backlogs: 0, batch: '2020-2024', year: 2024 },
  ];

  const studentUsers = [];
  const studentProfiles = [];

  for (const s of studentData) {
    const user = await User.create({
      name: s.name,
      email: s.email,
      password: 'Student@123',
      role: 'STUDENT',
      phone: s.phone,
      isActive: true,
      isVerified: true,
    });
    studentUsers.push(user);

    const profile = await Student.create({
      userId: user._id,
      rollNumber: `CSE${2021}${String(studentData.indexOf(s) + 1).padStart(3, '0')}`,
      registrationNumber: `REG${Date.now()}${studentData.indexOf(s)}`,
      department: departments[s.dept]._id,
      degree: 'B.Tech',
      batch: s.batch,
      graduationYear: s.year,
      cgpa: s.cgpa,
      tenthPercentage: s.ten,
      twelfthPercentage: s.twelve,
      activeBacklogs: s.backlogs,
      previousBacklogs: 0,
      gender: studentData.indexOf(s) % 2 === 0 ? 'Male' : 'Female',
      city: ['Bangalore', 'Mumbai', 'Delhi', 'Chennai'][Math.floor(Math.random() * 4)],
      state: 'Karnataka',
      skills: ['JavaScript', 'Python', 'Java'],
      programmingLanguages: ['Python', 'JavaScript', 'C++'],
      frameworks: ['React', 'Node.js', 'Express'],
      databases: ['MongoDB', 'MySQL'],
      linkedin: `https://linkedin.com/in/${s.name.toLowerCase().replace(' ', '')}`,
      github: `https://github.com/${s.name.toLowerCase().replace(' ', '')}`,
      profileCompletion: 75,
    });
    studentProfiles.push(profile);
  }
  console.log('✅ Students seeded');

  // Companies
  const companyData = [
    { name: 'TechCorp India', email: 'hr@techcorp.com', industry: 'Information Technology', size: '1001-5000', hq: 'Bangalore', hrName: 'Meera Joshi', hrPhone: '9222222221', approved: true },
    { name: 'Infosys BPM', email: 'hr@infosys.com', industry: 'IT Services', size: '5000+', hq: 'Bangalore', hrName: 'Suresh Nair', hrPhone: '9222222222', approved: true },
    { name: 'Wipro Technologies', email: 'hr@wipro.com', industry: 'IT Services', size: '5000+', hq: 'Hyderabad', hrName: 'Ravi Kumar', hrPhone: '9222222223', approved: true },
    { name: 'StartupXYZ', email: 'hr@startupxyz.com', industry: 'FinTech', size: '51-200', hq: 'Mumbai', hrName: 'Aisha Khan', hrPhone: '9222222224', approved: false },
  ];

  const companyUsers = [];
  const companyProfiles = [];

  for (const c of companyData) {
    const user = await User.create({
      name: c.name,
      email: c.email,
      password: 'Company@123',
      role: 'COMPANY',
      isActive: true,
      isVerified: c.approved,
    });
    companyUsers.push(user);

    const company = await Company.create({
      userId: user._id,
      companyName: c.name,
      industry: c.industry,
      website: `https://www.${c.name.toLowerCase().replace(/\s/g, '')}.com`,
      description: `${c.name} is a leading company in ${c.industry}`,
      headquarters: c.hq,
      companySize: c.size,
      hrName: c.hrName,
      hrEmail: c.email,
      hrPhone: c.hrPhone,
      approvalStatus: c.approved ? 'APPROVED' : 'PENDING',
      approvedBy: c.approved ? adminUser._id : null,
      approvedAt: c.approved ? new Date() : null,
    });
    companyProfiles.push(company);
  }
  console.log('✅ Companies seeded');

  // Placement Drives
  const drives = await PlacementDrive.insertMany([
    {
      companyId: companyProfiles[0]._id,
      createdBy: officerUser._id,
      jobTitle: 'Software Engineer',
      jobDescription: 'We are looking for passionate software engineers to join our growing team. You will work on cutting-edge technologies and build scalable solutions.',
      jobType: 'Full Time',
      location: 'Bangalore',
      workMode: 'Hybrid',
      package: { ctc: 12, breakup: 'Base: 9 LPA + Benefits: 3 LPA' },
      minimumCGPA: 7.5,
      maximumBacklogs: 0,
      minimum10thPercentage: 70,
      minimum12thPercentage: 70,
      eligibleDepartments: [departments[0]._id, departments[1]._id],
      eligibleBatches: ['2021-2025'],
      requiredSkills: ['JavaScript', 'React', 'Node.js'],
      applicationStartDate: new Date(),
      applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      driveDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      status: 'OPEN',
      numberOfOpenings: 15,
    },
    {
      companyId: companyProfiles[1]._id,
      createdBy: officerUser._id,
      jobTitle: 'Associate Software Engineer',
      jobDescription: 'Join Infosys BPM as an Associate Software Engineer. Work on enterprise-level projects and gain exposure to global clients.',
      jobType: 'Full Time',
      location: 'Pune',
      workMode: 'On-site',
      package: { ctc: 8, breakup: 'Base: 7 LPA + Benefits: 1 LPA' },
      minimumCGPA: 7.0,
      maximumBacklogs: 1,
      minimum10thPercentage: 60,
      minimum12thPercentage: 60,
      eligibleDepartments: [departments[0]._id, departments[1]._id, departments[2]._id],
      eligibleBatches: ['2021-2025'],
      requiredSkills: ['Java', 'SQL', 'Problem Solving'],
      applicationStartDate: new Date(),
      applicationDeadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      driveDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
      status: 'OPEN',
      numberOfOpenings: 30,
    },
    {
      companyId: companyProfiles[2]._id,
      createdBy: officerUser._id,
      jobTitle: 'Project Engineer',
      jobDescription: 'Wipro Technologies is hiring Project Engineers for their flagship digital transformation projects.',
      jobType: 'Full Time',
      location: 'Hyderabad',
      workMode: 'Hybrid',
      package: { ctc: 10, breakup: 'Base: 8.5 LPA + Benefits: 1.5 LPA' },
      minimumCGPA: 8.0,
      maximumBacklogs: 0,
      minimum10thPercentage: 75,
      minimum12thPercentage: 75,
      eligibleDepartments: [departments[0]._id, departments[1]._id],
      eligibleBatches: ['2021-2025'],
      requiredSkills: ['Python', 'Data Structures', 'Algorithms'],
      applicationStartDate: new Date(),
      applicationDeadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      driveDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
      status: 'OPEN',
      numberOfOpenings: 20,
    },
  ]);
  console.log('✅ Placement Drives seeded');

  // Applications (some students applied)
  const app1 = await Application.create({
    driveId: drives[0]._id,
    studentId: studentProfiles[0]._id,
    status: 'SHORTLISTED',
    statusHistory: [
      { status: 'APPLIED', updatedBy: studentUsers[0]._id },
      { status: 'UNDER_REVIEW', updatedBy: officerUser._id },
      { status: 'SHORTLISTED', updatedBy: officerUser._id, remarks: 'Strong profile' },
    ],
  });

  const app2 = await Application.create({
    driveId: drives[0]._id,
    studentId: studentProfiles[1]._id,
    status: 'SELECTED',
    statusHistory: [
      { status: 'APPLIED', updatedBy: studentUsers[1]._id },
      { status: 'SHORTLISTED', updatedBy: officerUser._id },
      { status: 'INTERVIEW', updatedBy: officerUser._id },
      { status: 'SELECTED', updatedBy: officerUser._id, remarks: 'Excellent performance' },
    ],
  });

  const app3 = await Application.create({
    driveId: drives[1]._id,
    studentId: studentProfiles[2]._id,
    status: 'APPLIED',
    statusHistory: [{ status: 'APPLIED', updatedBy: studentUsers[2]._id }],
  });

  await Application.create({
    driveId: drives[1]._id,
    studentId: studentProfiles[3]._id,
    status: 'SHORTLISTED',
    statusHistory: [
      { status: 'APPLIED', updatedBy: studentUsers[3]._id },
      { status: 'SHORTLISTED', updatedBy: officerUser._id },
    ],
  });

  // Update placed student
  await Student.findByIdAndUpdate(studentProfiles[1]._id, { placementStatus: 'PLACED' });

  // Create placement record for selected student
  await Placement.create({
    studentId: studentProfiles[1]._id,
    applicationId: app2._id,
    driveId: drives[0]._id,
    companyId: companyProfiles[0]._id,
    jobTitle: 'Software Engineer',
    package: 12,
    location: 'Bangalore',
    academicYear: '2021-2025',
    placementDate: new Date(),
  });
  console.log('✅ Applications & Placements seeded');

  // Sample notifications
  await Notification.insertMany([
    {
      recipient: studentUsers[0]._id,
      title: 'Application Shortlisted',
      message: 'Congratulations! You have been shortlisted for TechCorp India - Software Engineer',
      type: 'APPLICATION_SHORTLISTED',
      relatedId: drives[0]._id,
      isRead: false,
    },
    {
      recipient: studentUsers[1]._id,
      title: '🎉 Congratulations! Selected!',
      message: 'You have been selected by TechCorp India for Software Engineer position. Package: 12 LPA',
      type: 'SELECTED',
      relatedId: drives[0]._id,
      isRead: false,
    },
    {
      recipient: studentUsers[2]._id,
      title: 'New Placement Drive',
      message: 'Infosys BPM has opened a new drive for Associate Software Engineer. Apply now!',
      type: 'NEW_DRIVE',
      relatedId: drives[1]._id,
      isRead: false,
    },
  ]);
  console.log('✅ Notifications seeded');

  // Sample Announcements
  await Announcement.insertMany([
    {
      title: 'Campus Recruitment Season 2025 Kickoff',
      content: 'Welcome to the 2025 Campus Placement Season. All graduating students must ensure their profiles, resumes, and CGPAs are fully updated and verified by their department coordinators.',
      targetType: 'ALL_USERS',
      priority: 'HIGH',
      createdBy: officerUser._id,
    },
    {
      title: 'Pre-Placement Technical Assessment by TechCorp',
      content: 'Shortlisted candidates for TechCorp India are requested to join the virtual coding assessment link by 9:45 AM tomorrow. Keep your college IDs handy.',
      targetType: 'ALL_STUDENTS',
      priority: 'URGENT',
      createdBy: officerUser._id,
    },
  ]);
  console.log('✅ Announcements seeded');

  // Sample Support Ticket
  const ticket = await SupportTicket.create({
    subject: 'Request for CGPA correction post semester re-evaluation',
    description: 'My 6th semester SGPA was recently upgraded from 8.1 to 8.4 after re-evaluation. Requesting profile verification update for upcoming drives.',
    category: 'PROFILE_VERIFICATION',
    priority: 'HIGH',
    createdBy: studentUsers[0]._id,
    assignedTo: officerUser._id,
    status: 'IN_PROGRESS',
    messages: [
      {
        senderId: studentUsers[0]._id,
        message: 'My 6th semester SGPA was recently upgraded from 8.1 to 8.4 after re-evaluation. Requesting profile verification update for upcoming drives.',
        createdAt: new Date(),
      },
      {
        senderId: officerUser._id,
        message: 'Thank you Arjun. Please email your updated grade sheet to the placement cell, and we will update your verified score immediately.',
        createdAt: new Date(),
      },
    ],
  });
  console.log('✅ Support tickets seeded');

  // Sample Conversation & Message
  const conversation = await Conversation.create({
    participants: [studentUsers[0]._id, officerUser._id],
    conversationType: 'STUDENT_OFFICER',
    relatedEntity: 'General',
    lastMessage: {
      message: 'Sure sir, I will submit the updated grade card tomorrow morning.',
      senderId: studentUsers[0]._id,
      createdAt: new Date(),
    },
  });

  await Message.create({
    conversationId: conversation._id,
    senderId: officerUser._id,
    receiverId: studentUsers[0]._id,
    message: 'Hello Arjun, congratulations on being shortlisted for TechCorp India! Please be prepared for round 1.',
  });

  await Message.create({
    conversationId: conversation._id,
    senderId: studentUsers[0]._id,
    receiverId: officerUser._id,
    message: 'Sure sir, I will submit the updated grade card tomorrow morning.',
  });
  console.log('✅ Internal conversations & messages seeded');

  console.log('\n🎉 Database seeded successfully!\n');
  console.log('='.repeat(50));
  console.log('DEMO CREDENTIALS:');
  console.log('='.repeat(50));
  console.log('Super Admin:       admin@smartplacement.com     / Admin@123');
  console.log('Placement Officer: officer@smartplacement.com   / Officer@123');
  console.log('Student 1:         arjun@student.com            / Student@123');
  console.log('Student 2:         priya@student.com            / Student@123');
  console.log('Company:           hr@techcorp.com              / Company@123');
  console.log('='.repeat(50));

  process.exit(0);
};

seed().catch((err) => {
  console.error('Seeder error:', err);
  process.exit(1);
});
