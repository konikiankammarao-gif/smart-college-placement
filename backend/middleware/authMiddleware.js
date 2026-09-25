const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const mongoose = require('mongoose');
    let user = null;

    if (mongoose.connection.readyState === 1) {
      user = await User.findById(decoded.id).select('-password');
    } else {
      const DEMO_LIST = [
        { _id: '665000000000000000000001', name: 'Super Admin', email: 'admin@smartplacement.com', role: 'SUPER_ADMIN', phone: '9000000000', isActive: true, isVerified: true },
        { _id: '665000000000000000000002', name: 'Placement Officer', email: 'officer@smartplacement.com', role: 'PLACEMENT_OFFICER', phone: '9000000001', isActive: true, isVerified: true },
        { _id: '665000000000000000000003', name: 'Rahul Sharma', email: 'rahul.sharma@college.edu', role: 'STUDENT', phone: '9000000010', isActive: true, isVerified: true },
        { _id: '665000000000000000000004', name: 'Google Recruiter', email: 'hr@google.com', role: 'COMPANY', phone: '9000000020', isActive: true, isVerified: true }
      ];
      user = DEMO_LIST.find(u => u._id === decoded.id) || DEMO_LIST[0];
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'Account is suspended' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
  }
};

module.exports = { protect };
