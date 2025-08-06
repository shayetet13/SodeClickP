const mongoose = require('mongoose');

// Use existing Message model (defined in server.js)
// Check if Message model already exists, if not create it
let Message;
try {
  Message = mongoose.model('Message');
} catch (error) {
  // If model doesn't exist, create it
  const MessageSchema = new mongoose.Schema({
    from: String,
    text: String,
    image: String,
    user: {
      id: Number,
      name: String,
      avatar: String,
      verified: Boolean
    },
    replyTo: {
      text: String,
      user: {
        name: String
      }
    },
    timestamp: { type: Date, default: Date.now }
  }, { collection: 'messages' });
  
  Message = mongoose.model('Message', MessageSchema);
}

// @desc    Get total message count
// @route   GET /api/admin/messages/count
// @access  Private/Admin
exports.getMessageCount = async (req, res) => {
  try {
    const totalMessages = await Message.countDocuments();
    
    // Get messages from last 24 hours
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentMessages = await Message.countDocuments({
      timestamp: { $gte: last24Hours }
    });
    
    // Get messages from last 7 days
    const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const weeklyMessages = await Message.countDocuments({
      timestamp: { $gte: last7Days }
    });
    
    // Get messages from last 30 days
    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const monthlyMessages = await Message.countDocuments({
      timestamp: { $gte: last30Days }
    });
    
    console.log('Message statistics:', {
      total: totalMessages,
      last24h: recentMessages,
      last7d: weeklyMessages,
      last30d: monthlyMessages
    });
    
    res.json({
      success: true,
      data: {
        count: totalMessages,
        statistics: {
          total: totalMessages,
          last24Hours: recentMessages,
          lastWeek: weeklyMessages,
          lastMonth: monthlyMessages
        }
      }
    });
    
  } catch (error) {
    console.error('Error getting message count:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลข้อความ',
      error: error.message
    });
  }
};

// @desc    Get recent messages
// @route   GET /api/admin/messages/recent
// @access  Private/Admin
exports.getRecentMessages = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    
    const recentMessages = await Message.find()
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();
    
    res.json({
      success: true,
      data: recentMessages
    });
    
  } catch (error) {
    console.error('Error getting recent messages:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลข้อความล่าสุด',
      error: error.message
    });
  }
};

// @desc    Get message statistics by time period
// @route   GET /api/admin/messages/stats
// @access  Private/Admin
exports.getMessageStats = async (req, res) => {
  try {
    const now = new Date();
    
    // Messages by hour for last 24 hours
    const hourlyStats = [];
    for (let i = 23; i >= 0; i--) {
      const startHour = new Date(now.getTime() - i * 60 * 60 * 1000);
      startHour.setMinutes(0, 0, 0);
      const endHour = new Date(startHour.getTime() + 60 * 60 * 1000);
      
      const count = await Message.countDocuments({
        timestamp: { $gte: startHour, $lt: endHour }
      });
      
      hourlyStats.push({
        hour: startHour.getHours(),
        count: count,
        timestamp: startHour
      });
    }
    
    // Messages by day for last 7 days
    const dailyStats = [];
    for (let i = 6; i >= 0; i--) {
      const startDay = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      startDay.setHours(0, 0, 0, 0);
      const endDay = new Date(startDay.getTime() + 24 * 60 * 60 * 1000);
      
      const count = await Message.countDocuments({
        timestamp: { $gte: startDay, $lt: endDay }
      });
      
      dailyStats.push({
        day: startDay.toDateString(),
        count: count,
        timestamp: startDay
      });
    }
    
    res.json({
      success: true,
      data: {
        hourly: hourlyStats,
        daily: dailyStats
      }
    });
    
  } catch (error) {
    console.error('Error getting message stats:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงสถิติข้อความ',
      error: error.message
    });
  }
};