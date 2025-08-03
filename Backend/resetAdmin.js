const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// เชื่อมต่อ MongoDB
mongoose.connect('mongodb+srv://shayetet14:sdg5NrhmPFak8T3y@cluster0.2g7xxjp.mongodb.net/love?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log('✅ MongoDB Connected Successfully!');
  
  try {
    // ตรวจสอบว่ามีโมเดล User หรือไม่
    const User = mongoose.models.User || require('./models/User');
    
    // ค้นหา Admin user ด้วยทั้ง username และ email
    let admin = await User.findOne({ 
      $or: [
        { username: 'Admin' },
        { email: 'admin@sodeclick.com' }
      ]
    });
    
    if (admin) {
      console.log('Found Admin user:', admin.username, admin.email);
      console.log('Current password hash:', admin.password);
      
      // ทดสอบการเปรียบเทียบรหัสผ่าน
      const testPassword = 'root77';
      const isMatch = await bcrypt.compare(testPassword, admin.password);
      console.log('Current password matches "root77":', isMatch);
      
      if (!isMatch) {
        // เข้ารหัสรหัสผ่านใหม่ (root77)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('root77', salt);
        
        console.log('New password hash:', hashedPassword);
        
        // อัปเดตรหัสผ่าน
        admin.password = hashedPassword;
        await admin.save({ validateBeforeSave: false });
        
        console.log('✅ Reset Admin password successfully!');
      } else {
        console.log('✅ Admin password is already correct!');
      }
      
      console.log('Username:', admin.username);
      console.log('Email:', admin.email);
      console.log('Password: root77');
      console.log('Role:', admin.role);
    } else {
      console.log('❌ Admin user not found! Creating new admin...');
      
      // สร้าง Admin user ใหม่
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('root77', salt);
      
      const newAdmin = new User({
        username: 'Admin',
        email: 'admin@sodeclick.com',
        password: hashedPassword,
        role: 'admin',
        firstName: 'Admin',
        lastName: 'System',
        verified: true
      });
      
      await newAdmin.save();
      console.log('✅ Created new Admin user successfully!');
      console.log('Username:', newAdmin.username);
      console.log('Email:', newAdmin.email);
      console.log('Password: root77');
      console.log('Role:', newAdmin.role);
    }
  } catch (error) {
    console.error('Error resetting admin password:', error);
  } finally {
    // ปิดการเชื่อมต่อ
    await mongoose.connection.close();
    console.log('Connection closed');
    process.exit(0);
  }
})
.catch(err => {
  console.error('MongoDB Connection Error:', err);
  process.exit(1);
});
