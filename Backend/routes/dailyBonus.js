const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { requireActiveMembership } = require('../middleware/membership');
const UserActivity = require('../models/UserActivity');
const User = require('../models/User');

// @desc    Claim daily bonus
// @route   POST /api/daily-bonus/claim
// @access  Private
router.post('/claim', protect, requireActiveMembership, async (req, res) => {
  try {
    const userId = req.user.id;
    const membership = req.membership;
    
    // Check if user already claimed today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const lastClaim = await UserActivity.findOne({
      user: userId,
      activityType: 'daily_bonus',
      createdAt: { $gte: today }
    });

    if (lastClaim) {
      return res.status(403).json({
        success: false,
        message: 'คุณได้รับโบนัสรายวันแล้ว กรุณารอจนถึงวันพรุ่งนี้'
      });
    }

    // Add daily bonus to user
    const user = await User.findById(userId);
    const bonusAmount = membership.features.dailyBonus;
    user.coins = (user.coins || 0) + bonusAmount;
    await user.save();

    // Log bonus claim
    await UserActivity.create({
      user: userId,
      activityType: 'daily_bonus',
      description: `ได้รับโบนัสรายวัน ${bonusAmount} เหรียญ`,
      metadata: {
        bonusAmount: bonusAmount,
        membershipType: membership.planType
      }
    });

    res.json({
      success: true,
      message: `คุณได้รับโบนัสรายวัน ${bonusAmount} เหรียญ!`,
      data: {
        bonusAmount: bonusAmount,
        newBalance: user.coins
      }
    });

  } catch (error) {
    console.error('Daily bonus claim error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการรับโบนัสรายวัน'
    });
  }
});

// @desc    Get daily bonus status
// @route   GET /api/daily-bonus/status
// @access  Private
router.get('/status', protect, requireActiveMembership, async (req, res) => {
  try {
    const userId = req.user.id;
    const membership = req.membership;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const lastClaim = await UserActivity.findOne({
      user: userId,
      activityType: 'daily_bonus',
      createdAt: { $gte: today }
    });

    const canClaim = !lastClaim;
    const bonusAmount = membership.features.dailyBonus;

    res.json({
      success: true,
      data: {
        canClaim,
        bonusAmount,
        lastClaimDate: lastClaim?.createdAt || null
      }
    });

  } catch (error) {
    console.error('Get daily bonus status error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลสถานะโบนัสรายวัน'
    });
  }
});

module.exports = router; 