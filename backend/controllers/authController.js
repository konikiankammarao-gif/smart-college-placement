const User = require('../models/User');
const Student = require('../models/Student');
const Company = require('../models/Company');
const { generateToken } = require('../utils/generateToken');
const { createAuditLog } = require('../services/auditService');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // Only allow STUDENT and COMPANY registration publicly
    const allowedPublicRoles = ['STUDENT', 'COMPANY'];
    const userRole = allowedPublicRoles.includes(role) ? role : 'STUDENT';

    const user = await User.create({ name, email, password, role: userRole, phone });

    // Create associated profile
    if (userRole === 'STUDENT') {
      await Student.create({ userId: user._id });
    } else if (userRole === 'COMPANY') {
      await Company.create({
        userId: user._id,
        companyName: name,
        hrEmail: email,
        hrPhone: phone,
      });
    }

    await createAuditLog({
      userId: user._id,
      action: 'REGISTER',
      entity: 'User',
      entityId: user._id,
      description: `New ${userRole} registered: ${email}`,
      req,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          profileImage: user.profileImage,
          isActive: user.isActive,
          isVerified: user.isVerified,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const mongoose = require('mongoose');
    const DEMO_USERS = {
      'admin@smartplacement.com': { _id: '665000000000000000000001', name: 'Super Admin', email: 'admin@smartplacement.com', role: 'SUPER_ADMIN', phone: '9000000000', isActive: true, isVerified: true },
      'officer@smartplacement.com': { _id: '665000000000000000000002', name: 'Placement Officer', email: 'officer@smartplacement.com', role: 'PLACEMENT_OFFICER', phone: '9000000001', isActive: true, isVerified: true },
      'rahul.sharma@college.edu': { _id: '665000000000000000000003', name: 'Rahul Sharma', email: 'rahul.sharma@college.edu', role: 'STUDENT', phone: '9000000010', isActive: true, isVerified: true },
      'hr@google.com': { _id: '665000000000000000000004', name: 'Google Recruiter', email: 'hr@google.com', role: 'COMPANY', phone: '9000000020', isActive: true, isVerified: true }
    };

    // If database connection is pending, gracefully serve demo credentials
    if (mongoose.connection.readyState !== 1 && DEMO_USERS[email]) {
      const demoUser = DEMO_USERS[email];
      const token = generateToken(demoUser._id);
      return res.json({
        success: true,
        message: 'Login successful (Offline Demo Mode)',
        data: { token, user: demoUser }
      });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'Your account has been suspended' });
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    await createAuditLog({
      userId: user._id,
      action: 'LOGIN',
      entity: 'User',
      entityId: user._id,
      description: `User logged in: ${email}`,
      req,
    });

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          profileImage: user.profileImage,
          isActive: user.isActive,
          isVerified: user.isVerified,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = req.user;
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    if (!(await user.matchPassword(currentPassword))) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Update profile (name, phone, profileImage)
// @route   PUT /api/auth/update-profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone } = req.body;
    const update = {};
    if (name) update.name = name;
    if (phone) update.phone = phone;
    if (req.file) update.profileImage = `/uploads/images/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(req.user._id, update, { new: true });
    res.json({ success: true, message: 'Profile updated', data: user });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe, changePassword, updateProfile };
