const mongoose = require('mongoose');
const User = require('./models/User');

// ฟังก์ชันอัพเดทสถานะผู้ใช้เป็น Premium
const updateUsersToPremium = async () => {
  try {
    console.log('🔄 เชื่อมต่อ MongoDB...');
    await mongoose.connect('mongodb+srv://shayetet14:sdg5NrhmPFak8T3y@cluster0.2g7xxjp.mongodb.net/love?retryWrites=true&w=majority&appName=Cluster0');
    console.log('✅ เชื่อมต่อ MongoDB สำเร็จ!');

    // ตรวจสอบจำนวนผู้ใช้ปัจจุบัน
    const totalUsers = await User.countDocuments();
    const currentPremiumUsers = await User.countDocuments({ role: 'premium' });
    const regularUsers = await User.countDocuments({ role: 'user' });
    
    console.log(`📊 สถานะปัจจุบัน:`);
    console.log(`   ผู้ใช้ทั้งหมด: ${totalUsers} คน`);
    console.log(`   Premium: ${currentPremiumUsers} คน`);
    console.log(`   User ธรรมดา: ${regularUsers} คน`);

    // หาผู้ใช้ที่เป็น role 'user' เพื่อเลือกมาอัพเกรดเป็น premium
    const usersToUpgrade = await User.find({ 
      role: 'user',
      status: 'active' 
    }).limit(300);

    if (usersToUpgrade.length === 0) {
      console.log('❌ ไม่พบผู้ใช้ที่สามารถอัพเกรดได้');
      return;
    }

    console.log(`🎯 พบผู้ใช้ที่สามารถอัพเกรดได้: ${usersToUpgrade.length} คน`);

    // สุ่มเลือกผู้ใช้จำนวนที่ต้องการ (สูงสุด 300 คน)
    const numberOfUsersToUpgrade = Math.min(300, usersToUpgrade.length);
    const shuffledUsers = usersToUpgrade.sort(() => 0.5 - Math.random());
    const selectedUsers = shuffledUsers.slice(0, numberOfUsersToUpgrade);

    console.log(`🚀 เริ่มอัพเกรดผู้ใช้ ${numberOfUsersToUpgrade} คน เป็น Premium...`);

    // อัพเดทผู้ใช้ที่เลือกให้เป็น premium
    const userIds = selectedUsers.map(user => user._id);
    
    const updateResult = await User.updateMany(
      { _id: { $in: userIds } },
      { 
        $set: { 
          role: 'premium',
          verified: true // ให้ premium users เป็น verified ด้วย
        } 
      }
    );

    console.log(`✅ อัพเกรดสำเร็จ ${updateResult.modifiedCount} คน!`);

    // แสดงสถิติใหม่
    const newTotalUsers = await User.countDocuments();
    const newPremiumUsers = await User.countDocuments({ role: 'premium' });
    const newRegularUsers = await User.countDocuments({ role: 'user' });
    const adminUsers = await User.countDocuments({ role: 'admin' });

    console.log(`\n📊 สถานะหลังอัพเดท:`);
    console.log(`   ผู้ใช้ทั้งหมด: ${newTotalUsers} คน`);
    console.log(`   Premium: ${newPremiumUsers} คน (+${newPremiumUsers - currentPremiumUsers})`);
    console.log(`   User ธรรมดา: ${newRegularUsers} คน`);
    console.log(`   Admin: ${adminUsers} คน`);

    // แสดงตัวอย่างผู้ใช้ที่ถูกอัพเกรด
    console.log(`\n🌟 ตัวอย่างผู้ใช้ที่ถูกอัพเกรดเป็น Premium:`);
    selectedUsers.slice(0, 5).forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.firstName} ${user.lastName} (${user.username})`);
    });
    
    if (selectedUsers.length > 5) {
      console.log(`   ... และอีก ${selectedUsers.length - 5} คน`);
    }

    console.log(`\n✨ เสร็จสิ้นการอัพเกรดผู้ใช้!`);
    
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 ปิดการเชื่อมต่อ MongoDB');
    process.exit(0);
  }
};

// รันสคริปต์
updateUsersToPremium();
