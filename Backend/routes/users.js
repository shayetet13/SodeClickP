const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// GET /api/users/discover - ดึงรายชื่อผู้ใช้สำหรับ Discover tab (สมาชิก VIP เท่านั้น)
router.get('/discover', async (req, res) => {
  try {
    console.log('🔍 Fetching VIP users for discover...');
    
    // ดึงผู้ใช้ที่เป็นสมาชิก VIP เท่านั้น (เรียงตามลำดับความสำคัญ)
    
    // กำหนดลำดับความสำคัญของบทบาท
    const roleOrder = ['Platinum', 'Diamond', 'VIP2', 'VIP1', 'VIP', 'Gold', 'Silver'];
    const limit = 16; // จำนวนที่ต้องการแสดง
    let allUsers = [];
    
    // ดึงผู้ใช้ตามลำดับบทบาท
    for (const role of roleOrder) {
      if (allUsers.length >= limit) break; // หยุดถ้าครบจำนวนแล้ว
      
      const remainingSlots = limit - allUsers.length;
      
      const usersOfThisRole = await User.find({
        role: role, // บทบาทเฉพาะ
        verified: true, // แสดงเฉพาะที่ verified แล้ว
        status: 'active' // แสดงเฉพาะที่ active
      })
      .select('firstName lastName age location occupation address avatar interests verified createdAt role')
      .limit(remainingSlots) // จำกัดตามที่เหลือ
      .sort({ createdAt: -1 }); // เรียงตามผู้ใช้ใหม่ล่าสุด
      
      allUsers = allUsers.concat(usersOfThisRole);
      
      console.log(`Found ${usersOfThisRole.length} users with role ${role} (Total so far: ${allUsers.length})`);
    }
    
    console.log(`Found total ${allUsers.length} VIP users for discover in priority order`);

    // แปลงข้อมูลให้ตรงกับ format ที่ frontend ต้องการ
    const formattedUsers = allUsers.map(user => {
      // สร้าง avatar URL ที่ถูกต้อง
      let avatarUrl = `http://localhost:5000/uploads/avatar/default.png`;
      if (user.avatar) {
        // ถ้ามี avatar ใน database
        if (user.avatar.startsWith('http')) {
          // ถ้าเป็น external URL แล้ว (เช่น Unsplash)
          avatarUrl = user.avatar;
        } else if (user.avatar.startsWith('/uploads')) {
          // ถ้าเป็น local path ที่มี /uploads แล้ว
          avatarUrl = `http://localhost:5000${user.avatar}`;
        } else {
          // ถ้าเป็น filename เฉยๆ
          avatarUrl = `http://localhost:5000/uploads/avatar/${user.avatar}`;
        }
      }

      // กำหนดฟังก์ชันสำหรับแปลง role เป็นชื่อที่อ่านง่าย
      const getRoleName = (role) => {
        const roleNames = {
          'Platinum': 'Platinum',
          'Diamond': 'Diamond', 
          'VIP2': 'VIP 2',
          'VIP1': 'VIP 1',
          'VIP': 'VIP',
          'Gold': 'Gold',
          'Silver': 'Silver'
        };
        return roleNames[role] || role;
      };

      return {
        id: user._id,
        name: `${user.firstName} ${user.lastName}`,
        age: user.age || 25,
        location: user.location || '',
        occupation: user.occupation || '',
        address: user.address || '',
        avatar: avatarUrl,
        interests: user.interests || ['Music', 'Travel'],
        verified: user.verified || false,
        status: "ออนไลน์", // สามารถปรับเป็น dynamic ได้
        role: user.role || 'user',
        roleName: getRoleName(user.role)
      };
    });

    res.json({
      success: true,
      data: formattedUsers,
      count: formattedUsers.length
    });

  } catch (error) {
    console.error('Error fetching discover users:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้',
      error: error.message
    });
  }
});

module.exports = router;
