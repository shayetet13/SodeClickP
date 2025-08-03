const express = require('express');
const {
  getPaymentHistory,
  initiatePayment,
  confirmPayment,
  handlePaymentFailure
} = require('../controllers/payment');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(protect);

router.get('/history', getPaymentHistory);
router.post('/initiate', initiatePayment);
router.post('/confirm/:id', confirmPayment);
router.post('/failure/:id', handlePaymentFailure);

module.exports = router;
