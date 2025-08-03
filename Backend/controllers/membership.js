const Membership = require('../models/Membership');
const Payment = require('../models/Payment');
const User = require('../models/User');
const UserActivity = require('../models/UserActivity');

// Plan types and their details
const MEMBERSHIP_PLANS = {
  member: {
    name: "Member",
    price: 0,
    duration: 30, // days
    features: {
      dailyChats: 10,
      maxPhotos: 3,
      maxVideos: 1,
      spinWheelInterval: 1440, // minutes (24 hours)
      dailyBonus: 500,
      votePoints: 0,
      profileVideos: 0,
      verified: false,
      premiumFrame: false,
      pinnedPosts: 0,
      blurPhotos: 0,
      chatRooms: 0,
      hideOnlineStatus: false,
      transferCoins: false,
      bonusCoins: 0
    }
  },
  silver: {
    name: "Silver Member",
    price: 20,
    duration: 7, // days
    features: {
      dailyChats: 30,
      maxPhotos: 30,
      maxVideos: 10,
      spinWheelInterval: 120, // minutes (2 hours)
      dailyBonus: 1000,
      votePoints: 200,
      profileVideos: 0,
      verified: false,
      premiumFrame: false,
      pinnedPosts: 0,
      blurPhotos: 0,
      chatRooms: 0,
      hideOnlineStatus: false,
      transferCoins: false,
      bonusCoins: 0
    }
  },
  gold: {
    name: "Gold Member",
    price: 50,
    duration: 15, // days
    features: {
      dailyChats: 60,
      maxPhotos: 50,
      maxVideos: 25,
      spinWheelInterval: 90, // minutes
      dailyBonus: 3000,
      votePoints: 500,
      profileVideos: 1,
      verified: true,
      premiumFrame: true,
      pinnedPosts: 0,
      blurPhotos: 0,
      chatRooms: 0,
      hideOnlineStatus: false,
      transferCoins: false,
      bonusCoins: 0
    }
  },
  vip: {
    name: "VIP Member",
    price: 100,
    duration: 30, // days
    features: {
      dailyChats: 120,
      maxPhotos: 100,
      maxVideos: 50,
      spinWheelInterval: 60, // minutes (1 hour)
      dailyBonus: 8000,
      votePoints: 1000,
      profileVideos: 3,
      verified: true,
      premiumFrame: true,
      pinnedPosts: 1,
      blurPhotos: 3,
      chatRooms: 10,
      hideOnlineStatus: false,
      transferCoins: false,
      bonusCoins: 0
    }
  },
  vip1: {
    name: "VIP 1",
    price: 150,
    duration: 30, // days
    features: {
      dailyChats: 180,
      maxPhotos: 150,
      maxVideos: 75,
      spinWheelInterval: 45, // minutes
      dailyBonus: 15000,
      votePoints: 1500,
      profileVideos: 5,
      verified: true,
      premiumFrame: true,
      pinnedPosts: 3,
      blurPhotos: 5,
      chatRooms: 20,
      hideOnlineStatus: true,
      transferCoins: false,
      bonusCoins: 0
    }
  },
  vip2: {
    name: "VIP 2",
    price: 300,
    duration: 30, // days
    features: {
      dailyChats: 300,
      maxPhotos: 999, // unlimited
      maxVideos: 999, // unlimited
      spinWheelInterval: 30, // minutes
      dailyBonus: 30000,
      votePoints: 3000,
      profileVideos: 10,
      verified: true,
      premiumFrame: true,
      pinnedPosts: 5,
      blurPhotos: 10,
      chatRooms: 30,
      hideOnlineStatus: true,
      transferCoins: false,
      bonusCoins: 0
    }
  },
  diamond: {
    name: "Diamond Member",
    price: 500,
    duration: 30, // days
    features: {
      dailyChats: 500,
      maxPhotos: 999, // unlimited
      maxVideos: 999, // unlimited
      spinWheelInterval: 20, // minutes
      dailyBonus: 50000,
      votePoints: 5000,
      profileVideos: 15,
      verified: true,
      premiumFrame: true,
      pinnedPosts: 20,
      blurPhotos: 15,
      chatRooms: 999, // unlimited
      hideOnlineStatus: true,
      transferCoins: true,
      bonusCoins: 100000
    }
  },
  platinum: {
    name: "Platinum Member",
    price: 1000,
    duration: 30, // days
    features: {
      dailyChats: 999, // unlimited
      maxPhotos: 999, // unlimited
      maxVideos: 999, // unlimited
      spinWheelInterval: 10, // minutes
      dailyBonus: 100000,
      votePoints: 15000,
      profileVideos: 15,
      verified: true,
      premiumFrame: true,
      pinnedPosts: 20,
      blurPhotos: 15,
      chatRooms: 999, // unlimited
      hideOnlineStatus: true,
      transferCoins: true,
      bonusCoins: 100000
    }
  }
};

// @desc    Get current user's membership
// @route   GET /api/membership/me
// @access  Private
exports.getCurrentMembership = async (req, res) => {
  try {
    // Find the active membership for the user
    const membership = await Membership.findOne({
      user: req.user.id,
      status: 'active'
    });

    // If no active membership, return free tier
    if (!membership) {
      return res.json({
        success: true,
        data: {
          planType: 'member',
          planName: 'Member',
          status: 'active',
          features: MEMBERSHIP_PLANS.member.features,
          isFree: true
        }
      });
    }

    // Check if membership is expired
    await membership.checkAndUpdateStatus();

    res.json({
      success: true,
      data: membership
    });
  } catch (error) {
    console.error('Get current membership error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลสมาชิก',
      error: error.message
    });
  }
};

// @desc    Get available plans
// @route   GET /api/membership/plans
// @access  Public
exports.getMembershipPlans = async (req, res) => {
  try {
    res.json({
      success: true,
      data: MEMBERSHIP_PLANS
    });
  } catch (error) {
    console.error('Get membership plans error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลแพคเกจสมาชิก',
      error: error.message
    });
  }
};

// @desc    Upgrade membership
// @route   POST /api/membership/upgrade
// @access  Private
exports.upgradeMembership = async (req, res) => {
  try {
    const { planType, paymentMethod, transactionId } = req.body;

    if (!MEMBERSHIP_PLANS[planType]) {
      return res.status(400).json({
        success: false,
        message: 'แพคเกจสมาชิกไม่ถูกต้อง'
      });
    }

    const plan = MEMBERSHIP_PLANS[planType];
    
    // Check if user already has active membership
    const existingMembership = await Membership.findOne({
      user: req.user.id,
      status: 'active'
    });

    // สร้าง log และรายละเอียดการยกเลิกสมาชิกเดิม (ถ้ามี)
    if (existingMembership) {
      existingMembership.status = 'cancelled';
      existingMembership.updatedAt = new Date();
      await existingMembership.save();
      
      // บันทึกกิจกรรมการยกเลิกสมาชิกเดิม
      await UserActivity.create({
        user: req.user.id,
        activityType: 'membership_cancelled',
        description: `ยกเลิกสมาชิก ${existingMembership.planName} เพื่ออัพเกรดเป็น ${plan.name}`,
        metadata: {
          oldPlanType: existingMembership.planType,
          newPlanType: planType
        }
      });
    }

    // Calculate dates
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + plan.duration);

    // Create new membership
    const membership = await Membership.create({
      user: req.user.id,
      planType: planType,
      planName: plan.name,
      price: plan.price,
      duration: plan.duration,
      startDate: startDate,
      endDate: endDate,
      features: plan.features,
      paymentInfo: {
        transactionId: transactionId,
        paymentMethod: paymentMethod,
        paymentStatus: 'completed',
        paymentDate: new Date()
      }
    });

    // Create payment record (ถ้าเป็นแพคเกจแบบเสียเงิน)
    if (plan.price > 0) {
      await Payment.create({
        user: req.user.id,
        membership: membership._id,
        amount: plan.price,
        paymentMethod: paymentMethod,
        paymentProvider: 'system',
        transactionId: transactionId,
        status: 'completed'
      });
    }

    // อัพเดตสถานะผู้ใช้เป็น 'premium' ถ้าเป็นแพคเกจแบบเสียเงิน
    if (plan.price > 0) {
      await User.findByIdAndUpdate(req.user.id, { role: 'premium' });
    }

    // Log activity
    await UserActivity.create({
      user: req.user.id,
      activityType: 'membership_upgrade',
      description: `อัพเกรดเป็น ${plan.name}`,
      metadata: {
        planType: planType,
        price: plan.price,
        duration: plan.duration
      }
    });

    res.json({
      success: true,
      message: 'อัพเกรดสมาชิกสำเร็จ',
      data: membership
    });
  } catch (error) {
    console.error('Upgrade membership error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการอัพเกรดสมาชิก',
      error: error.message
    });
  }
};

// @desc    Get membership history
// @route   GET /api/membership/history
// @access  Private
exports.getMembershipHistory = async (req, res) => {
  try {
    const memberships = await Membership.find({
      user: req.user.id
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: memberships
    });
  } catch (error) {
    console.error('Get membership history error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงประวัติสมาชิก',
      error: error.message
    });
  }
};

// @desc    Cancel membership
// @route   POST /api/membership/cancel
// @access  Private
exports.cancelMembership = async (req, res) => {
  try {
    const { reason } = req.body;

    const membership = await Membership.findOne({
      user: req.user.id,
      status: 'active'
    });

    if (!membership) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบข้อมูลสมาชิกที่ใช้งานอยู่'
      });
    }

    membership.status = 'cancelled';
    membership.updatedAt = new Date();
    await membership.save();

    // Log activity
    await UserActivity.create({
      user: req.user.id,
      activityType: 'membership_cancelled',
      description: `ยกเลิกสมาชิก ${membership.planName}`,
      metadata: {
        reason: reason || 'ไม่ระบุเหตุผล',
        planType: membership.planType
      }
    });

    // If no other active memberships, downgrade user role
    const activeCount = await Membership.countDocuments({
      user: req.user.id,
      status: 'active'
    });

    if (activeCount === 0) {
      await User.findByIdAndUpdate(req.user.id, { role: 'user' });
    }

    res.json({
      success: true,
      message: 'ยกเลิกสมาชิกสำเร็จ'
    });
  } catch (error) {
    console.error('Cancel membership error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการยกเลิกสมาชิก',
      error: error.message
    });
  }
};

// @desc    Cancel auto-renewal for membership
// @route   PUT /api/membership/cancel-auto-renew
// @access  Private
exports.cancelAutoRenewal = async (req, res) => {
  try {
    const membership = await Membership.findOne({
      user: req.user.id,
      status: 'active'
    });

    if (!membership) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบข้อมูลสมาชิกที่ใช้งานอยู่'
      });
    }

    // Update the auto-renewal setting
    membership.autoRenew = false;
    membership.updatedAt = new Date();
    await membership.save();

    // Log activity
    await UserActivity.create({
      user: req.user.id,
      activityType: 'auto_renewal_cancelled',
      description: `ยกเลิกการต่ออายุอัตโนมัติสำหรับสมาชิก ${membership.planName}`,
      metadata: {
        planType: membership.planType
      }
    });

    res.json({
      success: true,
      message: 'ยกเลิกการต่ออายุอัตโนมัติสำเร็จ',
      data: membership
    });
  } catch (error) {
    console.error('Cancel auto-renewal error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการยกเลิกการต่ออายุอัตโนมัติ',
      error: error.message
    });
  }
};

// Export MEMBERSHIP_PLANS for use in other files
exports.MEMBERSHIP_PLANS = MEMBERSHIP_PLANS;
