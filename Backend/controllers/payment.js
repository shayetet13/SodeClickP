const Payment = require('../models/Payment');
const Membership = require('../models/Membership');
const UserActivity = require('../models/UserActivity');

// @desc    Get user payment history
// @route   GET /api/payments/history
// @access  Private
exports.getPaymentHistory = async (req, res) => {
  try {
    const payments = await Payment.find({
      user: req.user.id
    })
    .populate('membership', 'planType planName startDate endDate')
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: payments
    });
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงประวัติการชำระเงิน',
      error: error.message
    });
  }
};

// @desc    Initiate payment
// @route   POST /api/payments/initiate
// @access  Private
exports.initiatePayment = async (req, res) => {
  try {
    const { membershipId, paymentMethod } = req.body;

    const membership = await Membership.findById(membershipId);
    if (!membership) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบข้อมูลสมาชิก'
      });
    }

    // If it's not the user's membership
    if (membership.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'ไม่มีสิทธิ์ในการชำระเงินสำหรับสมาชิกนี้'
      });
    }

    // Create pending payment
    const payment = await Payment.create({
      user: req.user.id,
      membership: membershipId,
      amount: membership.price,
      paymentMethod,
      status: 'pending',
      transactionId: `TXN${Date.now()}`
    });

    // Log activity
    await UserActivity.create({
      user: req.user.id,
      activityType: 'payment_initiated',
      description: `เริ่มการชำระเงินสำหรับสมาชิก ${membership.planName}`,
      metadata: {
        paymentId: payment._id,
        amount: membership.price,
        paymentMethod
      }
    });

    res.json({
      success: true,
      message: 'เริ่มการชำระเงินสำเร็จ',
      data: {
        payment,
        paymentUrl: `/payment/confirm/${payment._id}`
      }
    });
  } catch (error) {
    console.error('Initiate payment error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการเริ่มการชำระเงิน',
      error: error.message
    });
  }
};

// @desc    Confirm payment (webhook or manual confirmation)
// @route   POST /api/payments/confirm/:id
// @access  Private
exports.confirmPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { transactionId } = req.body;

    const payment = await Payment.findById(id);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบข้อมูลการชำระเงิน'
      });
    }

    // Update payment status
    payment.status = 'completed';
    payment.transactionId = transactionId || payment.transactionId;
    payment.updatedAt = new Date();
    await payment.save();

    // Update membership payment info
    const membership = await Membership.findById(payment.membership);
    if (membership) {
      membership.paymentInfo = {
        ...membership.paymentInfo,
        paymentStatus: 'completed',
        transactionId: payment.transactionId,
        paymentDate: new Date()
      };
      membership.status = 'active';
      await membership.save();
    }

    // Log activity
    await UserActivity.create({
      user: payment.user,
      activityType: 'payment_completed',
      description: `ชำระเงินสำเร็จสำหรับสมาชิก ${membership ? membership.planName : 'ไม่ระบุ'}`,
      metadata: {
        paymentId: payment._id,
        amount: payment.amount,
        transactionId: payment.transactionId
      }
    });

    res.json({
      success: true,
      message: 'ยืนยันการชำระเงินสำเร็จ',
      data: payment
    });
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการยืนยันการชำระเงิน',
      error: error.message
    });
  }
};

// @desc    Handle payment failure
// @route   POST /api/payments/failure/:id
// @access  Private
exports.handlePaymentFailure = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const payment = await Payment.findById(id);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบข้อมูลการชำระเงิน'
      });
    }

    // Update payment status
    payment.status = 'failed';
    payment.metadata = {
      ...payment.metadata,
      failureReason: reason || 'ไม่ระบุเหตุผล'
    };
    payment.updatedAt = new Date();
    await payment.save();

    // Log activity
    await UserActivity.create({
      user: payment.user,
      activityType: 'payment_failed',
      description: `การชำระเงินล้มเหลว`,
      metadata: {
        paymentId: payment._id,
        amount: payment.amount,
        reason: reason || 'ไม่ระบุเหตุผล'
      }
    });

    res.json({
      success: true,
      message: 'บันทึกการชำระเงินล้มเหลวสำเร็จ',
      data: payment
    });
  } catch (error) {
    console.error('Payment failure error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการบันทึกการชำระเงินล้มเหลว',
      error: error.message
    });
  }
};
