const express = require('express');
const {
  getCurrentMembership,
  getMembershipPlans,
  upgradeMembership,
  getMembershipHistory,
  cancelMembership,
  cancelAutoRenewal
} = require('../controllers/membership');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/plans', getMembershipPlans);

// Protected routes
router.get('/me', protect, getCurrentMembership);
router.get('/history', protect, getMembershipHistory);
router.post('/upgrade', protect, upgradeMembership);
router.post('/cancel', protect, cancelMembership);
router.put('/cancel-auto-renew', protect, cancelAutoRenewal);

module.exports = router;
