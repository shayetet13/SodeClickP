const express = require('express');
const {
  getAllMemberships,
  getMembershipStats,
  updateMembershipStatus,
  extendMembership
} = require('../controllers/adminMembership');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes require admin access
router.use(protect);
router.use(authorize('admin'));

router.get('/', getAllMemberships);
router.get('/stats', getMembershipStats);
router.put('/:id/status', updateMembershipStatus);
router.put('/:id/extend', extendMembership);

module.exports = router;
