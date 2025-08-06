const express = require('express');
const {
  getRecentActivities,
  getActivityStats
} = require('../controllers/adminActivities');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes require admin access
router.use(protect);
router.use(authorize('admin'));

// @desc    Get recent user activities
// @route   GET /api/admin/activities/recent
router.get('/recent', getRecentActivities);

// @desc    Get activity statistics
// @route   GET /api/admin/activities/stats
router.get('/stats', getActivityStats);

module.exports = router;