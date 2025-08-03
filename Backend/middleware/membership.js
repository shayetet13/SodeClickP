const Membership = require('../models/Membership');

// Check if user has active membership
exports.requireActiveMembership = async (req, res, next) => {
  try {
    const membership = await Membership.findOne({
      user: req.user.id,
      status: 'active'
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: 'ต้องมีสมาชิกที่ใช้งานอยู่'
      });
    }

    // Check if expired
    if (membership.isExpired()) {
      membership.status = 'expired';
      await membership.save();
      
      return res.status(403).json({
        success: false,
        message: 'สมาชิกหมดอายุแล้ว'
      });
    }

    req.membership = membership;
    next();
  } catch (error) {
    console.error('Check membership error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการตรวจสอบสมาชิก'
    });
  }
};

// Check specific plan type
exports.requirePlan = (planTypes) => {
  return async (req, res, next) => {
    try {
      if (!req.membership) {
        return res.status(403).json({
          success: false,
          message: 'ไม่พบข้อมูลสมาชิก'
        });
      }

      if (!planTypes.includes(req.membership.planType)) {
        return res.status(403).json({
          success: false,
          message: 'สมาชิกของคุณไม่มีสิทธิ์ใช้งานฟีเจอร์นี้'
        });
      }

      next();
    } catch (error) {
      console.error('Check plan error:', error);
      res.status(500).json({
        success: false,
        message: 'เกิดข้อผิดพลาดในการตรวจสอบแผนสมาชิก'
      });
    }
  };
};

// Check daily usage limits
exports.checkDailyLimit = (featureType) => {
  return async (req, res, next) => {
    try {
      if (!req.membership) {
        return res.status(403).json({
          success: false,
          message: 'ไม่พบข้อมูลสมาชิก'
        });
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const UserActivity = require('../models/UserActivity');
      const dailyUsage = await UserActivity.countDocuments({
        user: req.user.id,
        activityType: featureType,
        createdAt: { $gte: today }
      });

      const limit = req.membership.features.dailyChats || 0;
      
      if (limit > 0 && dailyUsage >= limit) {
        return res.status(403).json({
          success: false,
          message: 'เกินขีดจำกัดการใช้งานรายวัน',
          data: {
            used: dailyUsage,
            limit: limit
          }
        });
      }

      req.dailyUsage = dailyUsage;
      next();
    } catch (error) {
      console.error('Check daily limit error:', error);
      res.status(500).json({
        success: false,
        message: 'เกิดข้อผิดพลาดในการตรวจสอบขีดจำกัดการใช้งาน'
      });
    }
  };
};
