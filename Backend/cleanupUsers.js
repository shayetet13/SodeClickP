const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

// เชื่อมต่อ MongoDB
mongoose.connect('mongodb+srv://shayetet14:sdg5NrhmPFak8T3y@cluster0.2g7xxjp.mongodb.net/love?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log('✅ MongoDB Connected Successfully!');
  
  try {
    // ลบเฉพาะ sample users ที่สร้างใหม่ (เก็บ account เดิมไว้)
    const samplesToDelete = [
      'john_active', 'jane_premium', 'mike_banned', 'sarah_suspended', 
      'alex_active', 'emma_banned', 'david_active', 'lisa_suspended'
    ];
    
    await User.deleteMany({ username: { $in: samplesToDelete } });
    console.log('🗑️ Cleared sample users only');

    // เช็คว่ามี users อะไรอยู่บ้าง
    const existingUsers = await User.find({}, 'username email firstName lastName verified');
    console.log('📋 Existing users:');
    existingUsers.forEach(user => {
      console.log(`   - ${user.username} (${user.email}) - ${user.firstName} ${user.lastName} - Verified: ${user.verified ? '✓' : '✗'}`);
    });

    // สร้าง 2 sample users เท่านั้น
    const newUsers = [
      {
        username: 'emma_demo',
        email: 'emma@demo.com',
        password: await bcrypt.hash('password123', 10),
        firstName: 'Emma',
        lastName: 'Wilson',
        age: 26,
        role: 'user',
        status: 'active',
        verified: true,
        location: 'Bangkok',
        interests: ['Travel', 'Photography', 'Music'],
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 วันที่แล้ว
        lastLogin: new Date(Date.now() - 1 * 60 * 60 * 1000) // 1 ชั่วโมงที่แล้ว
      },
      {
        username: 'alex_demo',
        email: 'alex@demo.com',
        password: await bcrypt.hash('password123', 10),
        firstName: 'Alex',
        lastName: 'Johnson',
        age: 28,
        role: 'user',
        status: 'active',
        verified: true,
        location: 'Chiang Mai',
        interests: ['Fitness', 'Cooking', 'Movies'],
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 วันที่แล้ว
        lastLogin: new Date(Date.now() - 30 * 60 * 1000) // 30 นาทีที่แล้ว
      }
    ];

    // สร้าง users ใหม่
    for (const userData of newUsers) {
      const existingUser = await User.findOne({ 
        $or: [{ email: userData.email }, { username: userData.username }] 
      });
      
      if (!existingUser) {
        await User.create(userData);
        console.log(`✅ Created user: ${userData.firstName} ${userData.lastName}`);
      } else {
        console.log(`⚠️ User already exists: ${userData.username}`);
      }
    }

    // แสดงสถิติสุดท้าย
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ status: 'active' });
    const verifiedUsers = await User.countDocuments({ verified: true });
    
    console.log('\n📊 Final Database Statistics:');
    console.log(`- Total Users: ${totalUsers}`);
    console.log(`- Active Users: ${activeUsers}`);
    console.log(`- Verified Users: ${verifiedUsers}`);

    // แสดงรายชื่อทั้งหมด
    const allUsers = await User.find({}, 'username email firstName lastName role status verified');
    console.log('\n🔍 All Users:');
    allUsers.forEach(user => {
      const statusIcon = user.status === 'active' ? '✅' : user.status === 'banned' ? '❌' : '⚠️';
      const verifiedIcon = user.verified ? '✓' : '✗';
      console.log(`- ${user.firstName} ${user.lastName} (${user.email}) - ${user.role} - ${user.status} ${statusIcon} ${verifiedIcon}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
    console.log('📴 Connection closed');
    process.exit(0);
  }
})
.catch(err => {
  console.error('❌ MongoDB Connection Error:', err);
  process.exit(1);
});
