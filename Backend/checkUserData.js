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
    // ดูข้อมูลผู้ใช้ที่มีข้อมูลครบถ้วน
    const users = await User.find({ role: { $ne: 'admin' } });
    
    console.log('👥 User profile data:');
    users.forEach(user => {
      console.log(`\n📝 ${user.firstName} ${user.lastName}:`);
      console.log(`   📧 Email: ${user.email}`);
      console.log(`   🎂 Age: ${user.age || 'ไม่ระบุ'}`);
      console.log(`   📍 Location: ${user.location || 'ไม่ระบุ'}`);
      console.log(`   💼 Occupation: ${user.occupation || 'ไม่ระบุ'}`);
      console.log(`   🏠 Address: ${user.address || 'ไม่ระบุ'}`);
      console.log(`   📱 Phone: ${user.phone || 'ไม่ระบุ'}`);
      console.log(`   🎯 Interests: ${user.interests ? user.interests.join(', ') : 'ไม่ระบุ'}`);
      console.log(`   📷 Avatar: ${user.avatar || 'ไม่ระบุ'}`);
    });

    // ตรวจสอบฟิลด์ที่มีอยู่
    const sampleUser = users[0];
    if (sampleUser) {
      console.log('\n🔍 Available fields in User model:');
      Object.keys(sampleUser.toObject()).forEach(field => {
        console.log(`   - ${field}: ${typeof sampleUser[field]}`);
      });
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
