const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { requireActiveMembership } = require('../middleware/membership');
const UserActivity = require('../models/UserActivity');
const User = require('../models/User');

// @desc    Spin the wheel and get rewards
// @route   POST /api/spin-wheel/spin
// @access  Private
router.post('/spin', protect, requireActiveMembership, async (req, res) => {
  try {
    const userId = req.user.id;
    const membership = req.membership;
    
    // Check if user can spin (based on membership interval)
    const lastSpin = await UserActivity.findOne({
      user: userId,
      activityType: 'spin_wheel',
      createdAt: { 
        $gte: new Date(Date.now() - (membership.features.spinWheelInterval * 60 * 1000))
      }
    });

    if (lastSpin) {
      const timeLeft = Math.ceil((lastSpin.createdAt.getTime() + (membership.features.spinWheelInterval * 60 * 1000) - Date.now()) / (1000 * 60));
      return res.status(403).json({
        success: false,
        message: `คุณต้องรอ ${timeLeft} นาที ก่อนจะหมุนวงล้อได้อีกครั้ง`,
        data: { timeLeft }
      });
    }

    // Generate random reward
    const rewards = [
      { type: 'coins', amount: 100, probability: 40 },
      { type: 'coins', amount: 200, probability: 30 },
      { type: 'coins', amount: 500, probability: 20 },
      { type: 'coins', amount: 1000, probability: 8 },
      { type: 'coins', amount: 2000, probability: 2 }
    ];

    const random = Math.random() * 100;
    let cumulativeProbability = 0;
    let selectedReward = rewards[0];

    for (const reward of rewards) {
      cumulativeProbability += reward.probability;
      if (random <= cumulativeProbability) {
        selectedReward = reward;
        break;
      }
    }

    // Add coins to user
    const user = await User.findById(userId);
    user.coins = (user.coins || 0) + selectedReward.amount;
    await user.save();

    // Log spin activity
    await UserActivity.create({
      user: userId,
      activityType: 'spin_wheel',
      description: `หมุนวงล้อและได้รับ ${selectedReward.amount} เหรียญ`,
      metadata: {
        rewardType: selectedReward.type,
        rewardAmount: selectedReward.amount
      }
    });

    res.json({
      success: true,
      message: `คุณได้รับ ${selectedReward.amount} เหรียญ!`,
      data: {
        reward: selectedReward,
        newBalance: user.coins
      }
    });

  } catch (error) {
    console.error('Spin wheel error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการหมุนวงล้อ'
    });
  }
});

// @desc    Get spin wheel status
// @route   GET /api/spin-wheel/status
// @access  Private
router.get('/status', protect, requireActiveMembership, async (req, res) => {
  try {
    const userId = req.user.id;
    const membership = req.membership;
    
    const lastSpin = await UserActivity.findOne({
      user: userId,
      activityType: 'spin_wheel'
    }).sort({ createdAt: -1 });

    const canSpin = !lastSpin || 
      (Date.now() - lastSpin.createdAt.getTime()) >= (membership.features.spinWheelInterval * 60 * 1000);

    const timeLeft = lastSpin && !canSpin ? 
      Math.ceil((lastSpin.createdAt.getTime() + (membership.features.spinWheelInterval * 60 * 1000) - Date.now()) / (1000 * 60)) : 0;

    res.json({
      success: true,
      data: {
        canSpin,
        timeLeft,
        interval: membership.features.spinWheelInterval
      }
    });

  } catch (error) {
    console.error('Get spin wheel status error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลสถานะวงล้อ'
    });
  }
});

module.exports = router; 