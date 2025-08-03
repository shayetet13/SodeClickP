const User = require('./models/User');

// ทดสอบ API discover โดยตรง
async function testDiscoverAPI() {
  try {
    console.log('🔍 Testing Discover API directly...');
    
    // ใช้ MongoDB connection ที่มีอยู่แล้ว (เนื่องจาก server กำลังรัน)
    const users = await User.find({
      role: { $ne: 'admin' },
      verified: true,
      status: 'active'
    })
    .select('firstName lastName age location occupation address avatar interests verified createdAt')
    .limit(15)
    .sort({ createdAt: -1 });

    console.log(`📊 Raw data from DB: ${users.length} users found`);
    
    const formattedUsers = users.map(user => {
      let avatarUrl = '/uploads/avatar/default.png';
      
      if (user.avatar) {
        if (user.avatar.startsWith('http')) {
          avatarUrl = user.avatar;
        } else if (user.avatar.startsWith('/uploads')) {
          avatarUrl = `http://localhost:5000${user.avatar}`;
        } else {
          avatarUrl = `http://localhost:5000/uploads/avatar/${user.avatar}`;
        }
      }

      return {
        id: user._id,
        name: `${user.firstName} ${user.lastName}`,
        age: user.age || 25,
        location: user.location || 'ไม่ระบุ',
        occupation: user.occupation || 'ไม่ระบุ',
        address: user.address || 'ไม่ระบุ',
        avatar: avatarUrl,
        interests: user.interests || ['Music', 'Travel'],
        verified: user.verified || false,
        status: "ออนไลน์"
      };
    });

    console.log('\n🎯 Final API Response format:');
    formattedUsers.forEach((user, index) => {
      console.log(`\n👤 User ${index + 1}:`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Name: ${user.name}`);
      console.log(`   Location: ${user.location}`);
      console.log(`   Occupation: "${user.occupation}"`);
      console.log(`   Address: "${user.address}"`);
      console.log(`   Avatar: ${user.avatar}`);
    });

    console.log('\n📋 API Response JSON:');
    console.log(JSON.stringify({
      success: true,
      data: formattedUsers,
      count: formattedUsers.length
    }, null, 2));

  } catch (error) {
    console.error('❌ Error testing API:', error.message);
  }
}

// เรียกใช้ทันที
testDiscoverAPI();
