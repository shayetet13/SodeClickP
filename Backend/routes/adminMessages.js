const express = require('express');
const {
  getMessageCount,
  getRecentMessages,
  getMessageStats
} = require('../controllers/adminMessages');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes require admin access
router.use(protect);
router.use(authorize('admin'));

// @desc    Get total message count
// @route   GET /api/admin/messages/count
router.get('/count', getMessageCount);

// @desc    Get recent messages
// @route   GET /api/admin/messages/recent
router.get('/recent', getRecentMessages);

// @desc    Get message statistics
// @route   GET /api/admin/messages/stats
router.get('/stats', getMessageStats);

module.exports = router;