const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

// ใช้ middleware protect และ authorize สำหรับทุก route
router.use(protect);
router.use(authorize('admin'));

// @desc    Admin dashboard stats
// @route   GET /api/admin/dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const User = require('../models/User');
    
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ status: 'active' });
    const bannedUsers = await User.countDocuments({ status: 'banned' });
    const premiumUsers = await User.countDocuments({ role: 'premium' });
    const newUsersToday = await User.countDocuments({
      createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
    });

    res.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        bannedUsers,
        premiumUsers,
        newUsersToday,
        onlineUsers: Math.floor(Math.random() * 100) + 50,
        totalMessages: Math.floor(Math.random() * 10000) + 5000
      }
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูล Dashboard',
      error: error.message
    });
  }
});

// @desc    Check admin access
// @route   GET /api/admin/check
router.get('/check', (req, res) => {
  res.json({
    success: true,
    message: 'Admin access granted',
    user: {
      id: req.user.id,
      username: req.user.username,
      role: req.user.role
    }
  });
});

module.exports = router;

