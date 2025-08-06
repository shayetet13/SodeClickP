const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// GET /api/superstars - ดึงรายชื่อซุปตาร์ที่มีโหวตมากที่สุด (Real data only)
router.get('/', async (req, res) => {
  try {
    console.log('🌟 Fetching superstars based on real voting data...');
    
    // ดึงผู้ใช้ที่มีโหวตจริง เรียงตามจำนวนโหวตมากที่สุด
    const superstarsData = await User.find({
      verified: true, // แสดงเฉพาะที่ verified แล้ว
      status: 'active', // แสดงเฉพาะที่ active
      'votingStats.totalVotes': { $gt: 0 } // มีโหวตมากกว่า 0
    })
    .select('firstName lastName age location occupation address avatar interests verified createdAt role votingStats')
    .sort({ 
      'votingStats.totalVotes': -1, // เรียงตามโหวตมากที่สุด
      'votingStats.totalStars': -1, // ถ้าโหวตเท่ากัน เรียงตามดาว
      'votingStats.totalHearts': -1 // ถ้าดาวเท่ากัน เรียงตามหัวใจ
    })
    .limit(20); // จำกัดแค่ 20 คน
    
    console.log(`Found ${superstarsData.length} superstars with real voting data`);
    
    // ถ้าไม่มีข้อมูลจริง ให้ส่งกลับ array ว่าง
    if (superstarsData.length === 0) {
      console.log('📊 No users with voting data found - returning empty array');
      return res.status(200).json({
        success: true,
        data: [],
        message: 'ยังไม่มีซุปตาร์ในระบบ - รอข้อมูลการโหวตจริง'
      });
    }
    
    // แปลงข้อมูลให้ตรงกับที่ frontend ต้องการ (ใช้ข้อมูลจริงเท่านั้น)
    const superstars = superstarsData.map((user, index) => {
      const votingStats = user.votingStats || {};
      
      return {
        id: user._id,
        name: `${user.firstName} ${user.lastName}`,
        age: user.age || 25,
        location: user.location || 'กรุงเทพฯ',
        avatar: user.avatar || null,
        membershipLevel: `${user.role} Member`,
        membershipColor: getMembershipColor(user.role),
        // ใช้ข้อมูลจริงจาก votingStats
        stars: votingStats.totalStars || 0,
        votes: votingStats.totalVotes || 0,
        hearts: votingStats.totalHearts || 0,
        rank: index + 1, // อันดับตามการเรียงลำดับ
        verified: user.verified || false,
        interests: user.interests || ['ท่องเที่ยว', 'อาหาร', 'ดนตรี'],
        status: 'ออนไลน์' // สมมติว่าออนไลน์ (ในอนาคตอาจดึงจาก real-time data)
      };
    });
    
    res.status(200).json({
      success: true,
      data: superstars,
      message: `Found ${superstars.length} superstars with real voting data`
    });
    
  } catch (error) {
    console.error('❌ Error fetching superstars:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลซุปตาร์',
      error: error.message
    });
  }
});

// POST /api/superstars/:userId/vote - โหวตให้ซุปตาร์
router.post('/:userId/vote', protect, async (req, res) => {
  try {
    const { userId } = req.params;
    const { voteType } = req.body; // 'star', 'vote', 'heart'
    const voterId = req.user.id;
    
    console.log(`🗳️ User ${voterId} voting ${voteType} for user ${userId}`);
    
    // ตรวจสอบว่าไม่ใช่การโหวตตัวเอง
    if (userId === voterId) {
      return res.status(400).json({
        success: false,
        message: 'ไม่สามารถโหวตให้ตัวเองได้'
      });
    }
    
    // หาผู้ใช้ที่จะได้รับโหวต
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบผู้ใช้ที่ต้องการโหวต'
      });
    }
    
    // ตรวจสอบประเภทโหวต
    if (!['star', 'vote', 'heart'].includes(voteType)) {
      return res.status(400).json({
        success: false,
        message: 'ประเภทโหวตไม่ถูกต้อง (star, vote, heart)'
      });
    }
    
    // อัปเดตข้อมูลโหวต
    if (!targetUser.votingStats) {
      targetUser.votingStats = {
        totalVotes: 0,
        totalStars: 0,
        totalHearts: 0,
        averageRating: 0
      };
    }
    
    // เพิ่มโหวตตามประเภท
    targetUser.votingStats.totalVotes += 1;
    if (voteType === 'star') {
      targetUser.votingStats.totalStars += 1;
    } else if (voteType === 'heart') {
      targetUser.votingStats.totalHearts += 1;
    }
    
    // อัปเดตวันที่โหวตล่าสุด
    targetUser.votingStats.lastVoteDate = new Date();
    
    // บันทึกข้อมูล
    await targetUser.save();
    
    console.log(`✅ Vote recorded: ${voteType} for user ${userId}. New stats:`, targetUser.votingStats);
    
    res.status(200).json({
      success: true,
      message: `โหวต ${voteType} สำเร็จ`,
      data: {
        userId: userId,
        voteType: voteType,
        newStats: targetUser.votingStats
      }
    });
    
  } catch (error) {
    console.error('❌ Error recording vote:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการบันทึกโหวต',
      error: error.message
    });
  }
});

// ฟังก์ชันกำหนดสีตามระดับสมาชิก
function getMembershipColor(role) {
  const colors = {
    'Platinum': 'cyan',
    'Diamond': 'sky',
    'VIP2': 'indigo',
    'VIP1': 'pink',
    'VIP': 'purple',
    'Gold': 'amber',
    'Silver': 'gray'
  };
  return colors[role] || 'gray';
}

module.exports = router; 