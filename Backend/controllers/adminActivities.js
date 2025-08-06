const UserActivity = require('../models/UserActivity');
const User = require('../models/User');

// @desc    Get recent user activities
// @route   GET /api/admin/activities/recent
// @access  Private/Admin
exports.getRecentActivities = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    
    const activities = await UserActivity.find()
      .populate('user', 'username firstName lastName')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    
    // Format activities for frontend
    const formattedActivities = activities.map((activity, index) => ({
      id: activity._id,
      type: activity.activityType,
      message: formatActivityMessage(activity),
      timestamp: activity.createdAt,
      status: getActivityStatus(activity.activityType),
      user: activity.user
    }));
    
    res.json({
      success: true,
      data: formattedActivities
    });
    
  } catch (error) {
    console.error('Error getting recent activities:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลกิจกรรมล่าสุด',
      error: error.message
    });
  }
};

// @desc    Get activity statistics
// @route   GET /api/admin/activities/stats
// @access  Private/Admin
exports.getActivityStats = async (req, res) => {
  try {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    // Activity counts by type
    const activityTypes = [
      'login', 'logout', 'registration', 'profile_update', 
      'password_change', 'membership_upgrade', 'membership_cancelled',
      'payment_completed', 'payment_failed', 'user_banned', 'user_unbanned'
    ];
    
    const typeStats = {};
    for (const type of activityTypes) {
      typeStats[type] = {
        total: await UserActivity.countDocuments({ activityType: type }),
        last24h: await UserActivity.countDocuments({ 
          activityType: type, 
          createdAt: { $gte: last24Hours } 
        }),
        lastWeek: await UserActivity.countDocuments({ 
          activityType: type, 
          createdAt: { $gte: lastWeek } 
        }),
        lastMonth: await UserActivity.countDocuments({ 
          activityType: type, 
          createdAt: { $gte: lastMonth } 
        })
      };
    }
    
    // Total activity counts
    const totalStats = {
      total: await UserActivity.countDocuments(),
      last24h: await UserActivity.countDocuments({ createdAt: { $gte: last24Hours } }),
      lastWeek: await UserActivity.countDocuments({ createdAt: { $gte: lastWeek } }),
      lastMonth: await UserActivity.countDocuments({ createdAt: { $gte: lastMonth } })
    };
    
    res.json({
      success: true,
      data: {
        total: totalStats,
        byType: typeStats
      }
    });
    
  } catch (error) {
    console.error('Error getting activity stats:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงสถิติกิจกรรม',
      error: error.message
    });
  }
};

// Helper function to format activity messages
const formatActivityMessage = (activity) => {
  const userName = activity.user ? 
    (activity.user.username || `${activity.user.firstName || ''} ${activity.user.lastName || ''}`.trim()) : 
    'ผู้ใช้ที่ถูกลบ';
  
  switch (activity.activityType) {
    case 'login':
      return `${userName} เข้าสู่ระบบ`;
    case 'logout':
      return `${userName} ออกจากระบบ`;
    case 'registration':
      return `ผู้ใช้ใหม่สมัครสมาชิก: ${userName}`;
    case 'profile_update':
      return `${userName} อัพเดตโปรไฟล์`;
    case 'password_change':
      return `${userName} เปลี่ยนรหัสผ่าน`;
    case 'membership_upgrade':
      return `อัพเกรดเป็น Premium: ${userName}`;
    case 'membership_cancelled':
      return `ยกเลิกสมาชิก Premium: ${userName}`;
    case 'payment_completed':
      return `ชำระเงินสำเร็จ: ${userName}`;
    case 'payment_failed':
      return `ชำระเงินล้มเหลว: ${userName}`;
    case 'user_banned':
      return `แบนบัญชี: ${userName}`;
    case 'user_unbanned':
      return `ยกเลิกการแบน: ${userName}`;
    default:
      return activity.description || `${userName} - ${activity.activityType}`;
  }
};

// Helper function to get activity status color
const getActivityStatus = (activityType) => {
  const statusMap = {
    'login': 'success',
    'logout': 'info',
    'registration': 'success',
    'profile_update': 'info',
    'password_change': 'info',
    'membership_upgrade': 'premium',
    'membership_cancelled': 'warning',
    'payment_completed': 'premium',
    'payment_failed': 'warning',
    'user_banned': 'warning',
    'user_unbanned': 'success'
  };
  
  return statusMap[activityType] || 'info';
};