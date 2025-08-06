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
    // เพิ่ม Tanachok account กลับมา
    const tanachokData = {
      username: 'Tanachok',
      email: 'Tanachoklu@gmail.com',
      password: await bcrypt.hash("c,Udgv'ot8iy[]", 10),
      firstName: 'Tanachok',
      lastName: 'User',
      age: 25,
      role: 'user',
      status: 'active',
      verified: true,
      location: 'Bangkok',
      interests: ['Music', 'Travel'],
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 วันที่แล้ว
      lastLogin: new Date()
    };

    const existingTanachok = await User.findOne({ 
      $or: [{ email: 'Tanachoklu@gmail.com' }, { username: 'Tanachok' }] 
    });
    
    if (!existingTanachok) {
      await User.create(tanachokData);
      console.log('✅ Restored Tanachok account');
    } else {
      console.log('⚠️ Tanachok account already exists');
    }

    // แสดงรายชื่อทั้งหมด
    const allUsers = await User.find({}, 'username email firstName lastName role status verified');
    console.log('\n🔍 All Users:');
    allUsers.forEach(user => {
      const statusIcon = user.status === 'active' ? '✅' : user.status === 'banned' ? '❌' : '⚠️';
      const verifiedIcon = user.verified ? '✓' : '✗';
      console.log(`- ${user.firstName} ${user.lastName} (${user.email}) - ${user.role} - ${user.status} ${statusIcon} ${verifiedIcon}`);
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
