const mongoose = require('mongoose');

// เชื่อมต่อ MongoDB
mongoose.connect('mongodb+srv://shayetet14:sdg5NrhmPFak8T3y@cluster0.2g7xxjp.mongodb.net/love?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log('✅ MongoDB Connected Successfully!');
  
  try {
    // ตรวจสอบและแก้ไข role ที่ไม่ถูกต้อง
    const invalidRoles = await mongoose.connection.db.collection('users').find({
      role: { $nin: ['user', 'premium', 'admin'] }
    }).toArray();
    
    console.log('Found users with invalid roles:', invalidRoles.length);
    
    if (invalidRoles.length > 0) {
      console.log('Invalid roles found:', invalidRoles.map(u => ({ 
        username: u.username, 
        role: u.role 
      })));
      
      // แก้ไข role ที่ไม่ถูกต้องเป็น 'user'
      const result = await mongoose.connection.db.collection('users').updateMany(
        { role: { $nin: ['user', 'premium', 'admin'] } },
        { $set: { role: 'user' } }
      );
      
      console.log('Fixed invalid roles:', result.modifiedCount, 'users');
    }
    
    // ตรวจสอบและแก้ไข status ที่ไม่ถูกต้อง
    const invalidStatus = await mongoose.connection.db.collection('users').find({
      status: { $nin: ['active', 'banned', 'suspended'] }
    }).toArray();
    
    console.log('Found users with invalid status:', invalidStatus.length);
    
    if (invalidStatus.length > 0) {
      console.log('Invalid status found:', invalidStatus.map(u => ({ 
        username: u.username, 
        status: u.status 
      })));
      
      // แก้ไข status ที่ไม่ถูกต้องเป็น 'active'
      const result = await mongoose.connection.db.collection('users').updateMany(
        { status: { $nin: ['active', 'banned', 'suspended'] } },
        { $set: { status: 'active' } }
      );
      
      console.log('Fixed invalid status:', result.modifiedCount, 'users');
    }
    
    // ตรวจสอบผู้ใช้ทั้งหมดหลังแก้ไข
    const allUsers = await mongoose.connection.db.collection('users').find({}).toArray();
    console.log('Total users:', allUsers.length);
    
    const usersByRole = allUsers.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});
    
    const usersByStatus = allUsers.reduce((acc, user) => {
      acc[user.status || 'undefined'] = (acc[user.status || 'undefined'] || 0) + 1;
      return acc;
    }, {});
    
    console.log('Users by role:', usersByRole);
    console.log('Users by status:', usersByStatus);
    
    console.log('✅ User data cleanup completed!');
    
  } catch (error) {
    console.error('❌ Error fixing user data:', error);
  } finally {
    await mongoose.connection.close();
    console.log('📴 Connection closed');
    process.exit(0);
  }
})
.catch(err => {
  console.error('❌ MongoDB Connection Error:', err);
  process.exit(1);
});
