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
    // ดูข้อมูล avatar ของผู้ใช้ทั้งหมด
    const users = await User.find({ role: { $ne: 'admin' } })
      .select('firstName lastName avatar verified status');
    
    console.log('👥 Users and their avatars:');
    users.forEach(user => {
      console.log(`- ${user.firstName} ${user.lastName}: ${user.avatar || 'NO AVATAR'} (${user.status})`);
    });
    
    console.log(`\n📊 Total users: ${users.length}`);
    const usersWithAvatar = users.filter(u => u.avatar);
    console.log(`📷 Users with avatar: ${usersWithAvatar.length}`);
    console.log(`🚫 Users without avatar: ${users.length - usersWithAvatar.length}`);

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
