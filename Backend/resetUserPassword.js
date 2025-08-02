// ไฟล์สำหรับรีเซ็ตรหัสผ่าน User
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// เชื่อมต่อกับ MongoDB
mongoose.connect('mongodb+srv://shayetet14:sdg5NrhmPFak8T3y@cluster0.2g7xxjp.mongodb.net/love?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log('✅ MongoDB Connected Successfully!');
  
  // นำเข้าโมเดล User
  const User = require('./models/User');
  
  try {
    // ค้นหา user โดยใช้ email
    const userEmail = 'Tanachoklu@gmail.com'; // ใช้ตัวใหญ่ตามที่มีในฐานข้อมูล
    const newPassword = "c,Udgv'ot8iy[]";
    
    console.log('🔍 Searching for user with email:', userEmail);
    const user = await User.findOne({ email: userEmail });
    
    if (user) {
      console.log('✅ Found user:', user.email, '- Username:', user.username);
      
      // เข้ารหัสรหัสผ่านใหม่
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      
      // อัปเดตรหัสผ่าน
      user.password = hashedPassword;
      await user.save();
      
      console.log('✅ Password reset successfully for user:', user.email);
      console.log('🔑 New password:', newPassword);
    } else {
      console.log('❌ User not found with email:', userEmail);
      
      // แสดงรายการ users ที่มีอยู่
      const allUsers = await User.find({}, 'email username').limit(10);
      console.log('📋 Available users:');
      allUsers.forEach(u => {
        console.log(`   - Email: ${u.email}, Username: ${u.username}`);
      });
    }
    
    // ปิดการเชื่อมต่อกับ MongoDB
    mongoose.connection.close();
    console.log('Connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    mongoose.connection.close();
    process.exit(1);
  }
})
.catch(err => {
  console.error('MongoDB Connection Error:', err);
  process.exit(1);
});
