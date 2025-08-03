const mongoose = require('mongoose');

// เชื่อมต่อกับ MongoDB
mongoose.connect('mongodb+srv://shayetet14:sdg5NrhmPFak8T3y@cluster0.2g7xxjp.mongodb.net/love?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const User = require('./models/User');

async function updateUserRoles() {
  try {
    console.log('🔄 Starting user role updates...');
    
    // ดึงข้อมูล users ที่ไม่ใช่ admin
    const allUsers = await User.find({ role: { $ne: 'admin' } }).sort({ createdAt: 1 });
    console.log(`📊 Found ${allUsers.length} non-admin users`);
    
    if (allUsers.length === 0) {
      console.log('❌ No users found to update');
      return;
    }
    
    // แปลง premium เป็น Silver ก่อน
    const premiumUsers = await User.find({ role: 'premium' });
    console.log(`🔄 Converting ${premiumUsers.length} premium users to Silver...`);
    
    for (const user of premiumUsers) {
      await User.findByIdAndUpdate(user._id, { role: 'Silver' }, { 
        validateBeforeSave: false 
      });
      console.log(`✅ Converted ${user.username} from premium to Silver`);
    }
    
    // ดึงข้อมูลใหม่หลังจากแปลง premium
    const updatedUsers = await User.find({ role: { $ne: 'admin' } }).sort({ createdAt: 1 });
    
    // กำหนดจำนวนและบทบาทใหม่
    const roleDistribution = [
      { role: 'VIP', count: 20 },
      { role: 'VIP1', count: 15 },
      { role: 'VIP2', count: 10 },
      { role: 'Gold', count: 20 },
      { role: 'Silver', count: 30 },
      { role: 'Diamond', count: 10 },
      { role: 'Platinum', count: 5 }
    ];
    
    let currentIndex = 0;
    let processedCount = 0;
    
    console.log('\n📝 Role distribution plan:');
    roleDistribution.forEach(item => {
      console.log(`${item.role}: ${item.count} users`);
    });
    console.log(`Total planned: ${roleDistribution.reduce((sum, item) => sum + item.count, 0)} users`);
    console.log(`Available users: ${updatedUsers.length} users\n`);
    
    // อัปเดตบทบาทตามแผน
    for (const roleInfo of roleDistribution) {
      console.log(`🔄 Assigning ${roleInfo.role} role to ${roleInfo.count} users...`);
      
      for (let i = 0; i < roleInfo.count && currentIndex < updatedUsers.length; i++) {
        const user = updatedUsers[currentIndex];
        
        await User.findByIdAndUpdate(user._id, { role: roleInfo.role }, { 
          validateBeforeSave: false 
        });
        
        console.log(`✅ ${user.username} (${user.memberId}) -> ${roleInfo.role}`);
        currentIndex++;
        processedCount++;
      }
      
      if (currentIndex >= updatedUsers.length) {
        console.log('⚠️  Reached end of user list');
        break;
      }
    }
    
    // ผู้ใช้ที่เหลือให้เป็น user ธรรมดา
    const remainingUsers = updatedUsers.slice(currentIndex);
    if (remainingUsers.length > 0) {
      console.log(`\n🔄 Setting ${remainingUsers.length} remaining users as 'user'...`);
      for (const user of remainingUsers) {
        await User.findByIdAndUpdate(user._id, { role: 'user' }, { 
          validateBeforeSave: false 
        });
        console.log(`✅ ${user.username} (${user.memberId}) -> user`);
        processedCount++;
      }
    }
    
    console.log(`\n✅ Role update completed!`);
    console.log(`📈 Total users processed: ${processedCount}`);
    
    // แสดงสรุปผลลัพธ์
    console.log('\n📊 Final role distribution:');
    const finalStats = await User.aggregate([
      { $match: { role: { $ne: 'admin' } } },
      { $group: { _id: '$role', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    
    finalStats.forEach(stat => {
      console.log(`${stat._id}: ${stat.count} users`);
    });
    
    // แสดงตัวอย่างผู้ใช้ในแต่ละบทบาท
    console.log('\n👥 Sample users by role:');
    for (const roleInfo of roleDistribution) {
      const sampleUsers = await User.find({ role: roleInfo.role })
        .select('username memberId role')
        .limit(3)
        .lean();
      
      if (sampleUsers.length > 0) {
        console.log(`\n${roleInfo.role}:`);
        sampleUsers.forEach(user => {
          console.log(`  - ${user.username} (${user.memberId})`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Error updating user roles:', error);
  } finally {
    mongoose.disconnect();
    console.log('\n🔌 Database connection closed');
  }
}

// รันสคริปต์
updateUserRoles();
