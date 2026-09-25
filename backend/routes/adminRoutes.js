const express = require('express');
const router = express.Router();
const {
  getUsers, createUser, updateUser, toggleUserStatus, deleteUser,
  getAuditLogs, getDepartments, createDepartment, updateDepartment, deleteDepartment
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect, authorize('SUPER_ADMIN'));

// Users
router.get('/users', getUsers);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.put('/users/:id/toggle-status', toggleUserStatus);
router.delete('/users/:id', deleteUser);

// Audit Logs
router.get('/audit-logs', getAuditLogs);

// Departments (also accessible by officer via admin route)
router.get('/departments', getDepartments);
router.post('/departments', createDepartment);
router.put('/departments/:id', updateDepartment);
router.delete('/departments/:id', deleteDepartment);

module.exports = router;
