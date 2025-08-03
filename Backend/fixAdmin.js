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
    }).select('+password');
    
    if (admin) {
      console.log('Found Admin user:', admin.username, admin.email);
      console.log('Current role:', admin.role);
      console.log('Password field type:', typeof admin.password);
      console.log('Password exists:', !!admin.password);
      
      // ลบ Admin user เก่าและสร้างใหม่เพื่อให้แน่ใจ
      await User.deleteOne({ _id: admin._id });
      console.log('Deleted existing admin user');
      
      // สร้าง Admin user ใหม่โดยใช้ bcrypt โดยตรง
      const newPassword = 'root77';
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      
      console.log('Generated new hash:', hashedPassword);
      console.log('Hash length:', hashedPassword.length);
      
      // สร้าง Admin ใหม่โดยไม่ผ่าน pre-save hook
      const result = await User.collection.insertOne({
        username: 'Admin',
        email: 'admin@sodeclick.com',
        password: hashedPassword,
        role: 'admin',
        firstName: 'Admin',
        lastName: 'System',
        verified: true,
        createdAt: new Date(),
        lastLogin: null
      });
      
      console.log('✅ Admin user recreated successfully!');
      console.log('Insert result:', result.insertedId);
      
      // ทดสอบการ login
      const testAdmin = await User.findOne({ username: 'Admin' }).select('+password');
      console.log('Test admin found:', !!testAdmin);
      console.log('Test admin password type:', typeof testAdmin.password);
      console.log('Test admin password length:', testAdmin.password ? testAdmin.password.length : 0);
      
      if (testAdmin && testAdmin.password) {
        const loginTest = await bcrypt.compare(newPassword, testAdmin.password);
        console.log('Final login test result:', loginTest);
      } else {
        console.log('❌ No password found in test admin');
      }
      
      console.log('=== ADMIN CREDENTIALS ===');
      console.log('Username: Admin');
      console.log('Email: admin@sodeclick.com');
      console.log('Password: root77');
      console.log('Role:', testAdmin?.role);
      console.log('========================');
    } else {
      console.log('❌ Admin user not found! Creating new admin...');
      
      // สร้าง Admin user ใหม่
      const newPassword = 'root77';
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      
      // สร้างผู้ใช้ใหม่โดยตรง
      const newAdmin = await User.create({
        username: 'Admin',
        email: 'admin@sodeclick.com',
        password: hashedPassword, // ใช้ hash ที่สร้างแล้ว
        role: 'admin',
        firstName: 'Admin',
        lastName: 'System',
        verified: true
      }, { validateBeforeSave: false });
      
      console.log('✅ Created new Admin user successfully!');
      console.log('Username:', newAdmin.username);
      console.log('Email:', newAdmin.email);
      console.log('Password: root77');
      console.log('Role:', newAdmin.role);
    }
  } catch (error) {
    console.error('❌ Error fixing admin:', error);
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

