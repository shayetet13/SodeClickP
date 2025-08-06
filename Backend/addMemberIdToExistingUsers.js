const mongoose = require('mongoose');

// เชื่อมต่อกับ MongoDB
mongoose.connect('mongodb+srv://shayetet14:sdg5NrhmPFak8T3y@cluster0.2g7xxjp.mongodb.net/love?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const User = require('./models/User');

async function addMemberIdToExistingUsers() {
  try {
    console.log('🔄 Starting member ID assignment...');
    
    // หา users ทั้งหมดที่ยังไม่มี member ID
    const usersWithoutMemberId = await User.find({ 
      $or: [
        { memberId: { $exists: false } },
        { memberId: null },
        { memberId: "" }
      ]
    }).sort({ createdAt: 1 }); // เรียงตามวันที่สร้าง (เก่าสุดก่อน)
    
    console.log(`📊 Found ${usersWithoutMemberId.length} users without member ID`);
    
    if (usersWithoutMemberId.length === 0) {
      console.log('✅ All users already have member IDs');
      return;
    }
    
    let memberIdCounter = 1;
    
    // แยก admin และ user ออกจากกัน
    const admins = usersWithoutMemberId.filter(user => user.role === 'admin');
    const regularUsers = usersWithoutMemberId.filter(user => user.role !== 'admin');
    
    console.log(`👑 Found ${admins.length} admin(s)`);
    console.log(`👤 Found ${regularUsers.length} regular user(s)`);
    
    // กำหนด member ID ให้ admin ก่อน (เริ่มจาก SD0000001)
    for (const admin of admins) {
      const memberId = `SD${memberIdCounter.toString().padStart(7, '0')}`;
      
      await User.findByIdAndUpdate(admin._id, { memberId }, { 
        validateBeforeSave: false // ข้าม validation เพื่อหลีกเลี่ยงการ hash password ใหม่
      });
      
      console.log(`👑 Admin "${admin.username}" assigned member ID: ${memberId}`);
      memberIdCounter++;
    }
    
    // กำหนด member ID ให้ regular users
    for (const user of regularUsers) {
      const memberId = `SD${memberIdCounter.toString().padStart(7, '0')}`;
      
      await User.findByIdAndUpdate(user._id, { memberId }, { 
        validateBeforeSave: false // ข้าม validation เพื่อหลีกเลี่ยงการ hash password ใหม่
      });
      
      console.log(`👤 User "${user.username}" assigned member ID: ${memberId}`);
      memberIdCounter++;
    }
    
    console.log('✅ Member ID assignment completed successfully!');
    console.log(`📈 Total users processed: ${usersWithoutMemberId.length}`);
    
    // แสดงข้อมูลสรุป
    const allUsers = await User.find({}, { username: 1, role: 1, memberId: 1 }).sort({ memberId: 1 });
    console.log('\n📋 Current user list:');
    allUsers.forEach(user => {
      console.log(`${user.memberId} - ${user.username} (${user.role})`);
    });
    
  } catch (error) {
    console.error('❌ Error adding member IDs:', error);
  } finally {
    mongoose.disconnect();
    console.log('🔌 Database connection closed');
  }
}

// รันสคริปต์
addMemberIdToExistingUsers();
