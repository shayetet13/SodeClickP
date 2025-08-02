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
    // สร้าง shayetet14 account กลับมา
    const shayetetData = {
      username: 'kao',
      email: 'shayetet14@protonmail.com',
      password: await bcrypt.hash('password123', 10), // รหัสผ่านเริ่มต้น
      firstName: 'Kao',
      lastName: 'Shayetet',
      age: 28,
      role: 'premium', // ให้เป็น premium เหมือนเดิม
      status: 'active',
      verified: true,
      location: 'Bangkok',
      interests: ['Technology', 'Gaming', 'Music'],
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 วันที่แล้ว (account เก่า)
      lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 ชั่วโมงที่แล้ว
    };

    // เช็คว่ามี account นี้อยู่แล้วหรือไม่
    const existingUser = await User.findOne({ 
      $or: [{ email: 'shayetet14@protonmail.com' }, { username: 'kao' }] 
    });
    
    if (!existingUser) {
      const newUser = await User.create(shayetetData);
      console.log('✅ Restored shayetet14@protonmail.com account successfully!');
      console.log(`   - Username: ${newUser.username}`);
      console.log(`   - Email: ${newUser.email}`);
      console.log(`   - Name: ${newUser.firstName} ${newUser.lastName}`);
      console.log(`   - Role: ${newUser.role}`);
      console.log(`   - Default Password: password123`);
    } else {
      console.log('⚠️ Account already exists:');
      console.log(`   - Username: ${existingUser.username}`);
      console.log(`   - Email: ${existingUser.email}`);
    }

    // แสดงรายชื่อทั้งหมดอีกครั้ง
    const allUsers = await User.find({}, 'username email firstName lastName role status verified');
    console.log('\n🔍 All Users After Restore:');
    allUsers.forEach(user => {
      const statusIcon = user.status === 'active' ? '✅' : user.status === 'banned' ? '❌' : '⚠️';
      const verifiedIcon = user.verified ? '✓' : '✗';
      console.log(`- ${user.firstName} ${user.lastName} (${user.email}) - ${user.username} - ${user.role} - ${user.status} ${statusIcon} ${verifiedIcon}`);
    });

    const totalUsers = await User.countDocuments();
    console.log(`\n📊 Total Users: ${totalUsers}`);

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
