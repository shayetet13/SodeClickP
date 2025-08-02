const express = require('express');
const {
  getAllUsers,
  banUser,
  unbanUser,
  getUserDetails,
  updateUserRole,
  getUserStats
} = require('../controllers/adminUsers');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes require admin access
router.use(protect);
router.use(authorize('admin'));

// @desc    Get all users with pagination and filtering
// @route   GET /api/admin/users
router.get('/', getAllUsers);

// @desc    Get user statistics
// @route   GET /api/admin/users/stats
router.get('/stats', getUserStats);

// @desc    Get VIP users with pagination and filtering
// @route   GET /api/admin/users/vip
router.get('/vip', getAllUsers);

// @desc    Get VIP users statistics
// @route   GET /api/admin/users/vip/stats
router.get('/vip/stats', getUserStats);

// @desc    Get user details by ID
// @route   GET /api/admin/users/:id
router.get('/:id', getUserDetails);

// @desc    Ban user
// @route   PUT /api/admin/users/:id/ban
router.put('/:id/ban', banUser);

// @desc    Unban user
// @route   PUT /api/admin/users/:id/unban
router.put('/:id/unban', unbanUser);

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
router.put('/:id/role', updateUserRole);

module.exports = router;
