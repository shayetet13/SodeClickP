const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

console.log('Starting simple admin reset...');

mongoose.connect('mongodb+srv://shayetet14:sdg5NrhmPFak8T3y@cluster0.2g7xxjp.mongodb.net/love?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log('✅ Connected to MongoDB');
  
  try {
    // ใช้ collection โดยตรง
    const usersCollection = mongoose.connection.db.collection('users');
    
    // ลบ admin users ทั้งหมด
    await usersCollection.deleteMany({ 
      $or: [
        { username: 'Admin' },
        { email: 'admin@sodeclick.com' }
      ]
    });
    console.log('🗑️ Deleted all existing admin users');
    
    // สร้าง password hash
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('root77', salt);
    console.log('🔐 Generated password hash');
    
    // สร้าง admin user ใหม่
    const adminUser = {
      username: 'Admin',
      email: 'admin@sodeclick.com',
      password: hashedPassword,
      role: 'admin',
      firstName: 'Admin',
      lastName: 'System',
      verified: true,
      createdAt: new Date(),
      lastLogin: null
    };
    
    const result = await usersCollection.insertOne(adminUser);
    console.log('✅ Created new admin user with ID:', result.insertedId);
    
    // ทดสอบการดึงข้อมูลและ login
    const createdAdmin = await usersCollection.findOne({ username: 'Admin' });
    console.log('👤 Found admin:', createdAdmin.username, createdAdmin.email);
    console.log('🔑 Password hash length:', createdAdmin.password.length);
    
    const testLogin = await bcrypt.compare('root77', createdAdmin.password);
    console.log('🧪 Login test result:', testLogin);
    
    if (testLogin) {
      console.log('🎉 ADMIN RESET SUCCESSFUL!');
      console.log('Username: Admin');
      console.log('Password: root77');
      console.log('Email: admin@sodeclick.com');
    } else {
      console.log('❌ Login test failed');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Connection closed');
    process.exit(0);
  }
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});
