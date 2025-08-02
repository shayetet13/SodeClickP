const mongoose = require('mongoose');
const User = require('./models/User');

// เชื่อมต่อ MongoDB
mongoose.connect('mongodb+srv://shayetet14:sdg5NrhmPFak8T3y@cluster0.2g7xxjp.mongodb.net/love?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log('✅ MongoDB Connected Successfully!');
  
  try {
    // ค้นหา user โดยใช้ email
    const user = await User.findOne({ 
      $or: [
        { email: 'Tanachoklu@gmail.com' },
        { email: 'tanachoklu@gmail.com' },
        { username: 'Tanachok' }
      ]
    });
    
    if (user) {
      console.log('✅ Found user account:');
      console.log(`📧 Email: ${user.email}`);
      console.log(`👤 Username: ${user.username}`);
      console.log(`🏷️ Name: ${user.firstName} ${user.lastName}`);
      console.log(`🔑 Password: สำหรับ account นี้ใช้รหัสที่ตั้งไว้ล่าสุด`);
      console.log(`📊 Status: ${user.status}`);
      console.log(`⭐ Role: ${user.role}`);
      console.log(`✓ Verified: ${user.verified}`);
      
      // แสดงข้อมูลการเข้าสู่ระบบ
      console.log('\n🔐 Login Information:');
      console.log(`   - ใช้ Username: ${user.username}`);
      console.log(`   - หรือ Email: ${user.email}`);
      console.log(`   - รหัสผ่าน: c,Udgv'ot8iy[]`);
      
    } else {
      console.log('❌ ไม่พบ account tanachoklu@gmail.com');
      
      // ค้นหา account ที่คล้ายกัน
      const similarUsers = await User.find({
        $or: [
          { email: { $regex: 'tanachok', $options: 'i' } },
          { username: { $regex: 'tanachok', $options: 'i' } },
          { firstName: { $regex: 'tanachok', $options: 'i' } }
        ]
      });
      
      if (similarUsers.length > 0) {
        console.log('🔍 Found similar accounts:');
        similarUsers.forEach(u => {
          console.log(`   - ${u.username} (${u.email}) - ${u.firstName} ${u.lastName}`);
        });
      }
    }

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
