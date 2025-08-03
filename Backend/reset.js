// ไฟล์สำหรับรีเซ็ตรหัสผ่าน Admin
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
    // ค้นหา Admin user
    const admin = await User.findOne({ username: 'Admin' });
    
    if (admin) {
      console.log('Found Admin user:', admin.username);
      
      // เข้ารหัสรหัสผ่านใหม่
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('root77', salt);
      
      // อัปเดตรหัสผ่าน
      admin.password = hashedPassword;
      await admin.save();
      
      console.log('✅ Reset Admin password successfully!');
    } else {
      console.log('❌ Admin user not found!');
      
      // สร้าง Admin user ใหม่
      const newAdmin = new User({
        username: 'Admin',
        email: 'admin@sodeclick.com',
        password: 'root77', // จะถูกเข้ารหัสโดยอัตโนมัติใน pre save hook
        role: 'admin',
        firstName: 'Admin',
        lastName: 'System',
        verified: true
      });
      
      await newAdmin.save();
      console.log('✅ Created new Admin user successfully!');
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
