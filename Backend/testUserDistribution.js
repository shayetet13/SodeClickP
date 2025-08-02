const mongoose = require('mongoose');
const User = require('./models/User');

// เชื่อมต่อ MongoDB
mongoose.connect('mongodb+srv://shayetet14:sdg5NrhmPFak8T3y@cluster0.2g7xxjp.mongodb.net/love?retryWrites=true&w=majority&appName=Cluster0')
.then(() => {
  console.log('✅ MongoDB Connected!');
  testUserDistribution();
})
.catch(err => console.error('❌ MongoDB Connection Failed:', err));

async function testUserDistribution() {
  try {
    console.log('\n🔍 Testing User Distribution by Role...\n');
    
    const roleOrder = ['Platinum', 'Diamond', 'VIP2', 'VIP1', 'VIP', 'Gold', 'Silver'];
    
    for (const role of roleOrder) {
      const count = await User.countDocuments({
        role: role,
        verified: true,
        status: 'active'
      });
      console.log(`${role.padEnd(8)}: ${count} users`);
    }
    
    console.log('\n📊 Simulating Exclusive Members Selection (16 users max)...\n');
    
    const limit = 16;
    let totalSelected = 0;
    
    for (const role of roleOrder) {
      if (totalSelected >= limit) break;
      
      const remainingSlots = limit - totalSelected;
      
      const users = await User.find({
        role: role,
        verified: true,
        status: 'active'
      })
      .select('username role')
      .limit(remainingSlots)
      .sort({ createdAt: -1 });
      
      console.log(`${role}: Selected ${users.length} users (${remainingSlots} slots available)`);
      
      // แสดงรายชื่อผู้ใช้ที่เลือก
      users.forEach((user, index) => {
        console.log(`  ${totalSelected + index + 1}. ${user.username} (${user.role})`);
      });
      
      totalSelected += users.length;
      
      if (users.length > 0) {
        console.log(`   → Total selected so far: ${totalSelected}\n`);
      }
    }
    
    console.log(`🎯 Final result: ${totalSelected} users selected for Exclusive Members`);
    
    mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    mongoose.disconnect();
  }
}
