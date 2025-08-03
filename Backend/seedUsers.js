const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

// เชื่อมต่อ MongoDB
mongoose.connect('mongodb+srv://shayetet14:sdg5NrhmPFak8T3y@cluster0.2g7xxjp.mongodb.net/love?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log('✅ MongoDB Connected Successfully!');
  
  try {
    // ลบข้อมูลเก่าทั้งหมด (ยกเว้น Admin)
    await User.deleteMany({ username: { $ne: 'Admin' } });
    console.log('🗑️ Cleared existing users (except Admin)');

    // สร้างข้อมูล users ตัวอย่างที่มีสถานะต่าง ๆ
    const sampleUsers = [
      {
        username: 'john_active',
        email: 'john@example.com',
        password: await bcrypt.hash('password123', 10),
        firstName: 'John',
        lastName: 'Doe',
        role: 'user',
        status: 'active',
        verified: true,
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      {
        username: 'jane_premium',
        email: 'jane@example.com',
        password: await bcrypt.hash('password123', 10),
        firstName: 'Jane',
        lastName: 'Smith',
        role: 'premium',
        status: 'active',
        verified: true,
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        lastLogin: new Date(Date.now() - 30 * 60 * 1000)
      },
      {
        username: 'mike_banned',
        email: 'mike@example.com',
        password: await bcrypt.hash('password123', 10),
        firstName: 'Mike',
        lastName: 'Wilson',
        role: 'user',
        status: 'banned',
        verified: false,
        banReason: 'Inappropriate behavior',
        bannedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        lastLogin: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
      },
      {
        username: 'sarah_suspended',
        email: 'sarah@example.com',
        password: await bcrypt.hash('password123', 10),
        firstName: 'Sarah',
        lastName: 'Jones',
        role: 'user',
        status: 'suspended',
        verified: true,
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        lastLogin: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      },
      {
        username: 'alex_active',
        email: 'alex@example.com',
        password: await bcrypt.hash('password123', 10),
        firstName: 'Alex',
        lastName: 'Brown',
        role: 'premium',
        status: 'active',
        verified: true,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        lastLogin: new Date(Date.now() - 10 * 60 * 1000)
      },
      {
        username: 'emma_banned',
        email: 'emma@example.com',
        password: await bcrypt.hash('password123', 10),
        firstName: 'Emma',
        lastName: 'Davis',
        role: 'user',
        status: 'banned',
        verified: false,
        banReason: 'Spam messages',
        bannedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
        lastLogin: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
      },
      {
        username: 'david_active',
        email: 'david@example.com',
        password: await bcrypt.hash('password123', 10),
        firstName: 'David',
        lastName: 'Miller',
        role: 'user',
        status: 'active',
        verified: true,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        lastLogin: new Date(Date.now() - 1 * 60 * 60 * 1000)
      },
      {
        username: 'lisa_suspended',
        email: 'lisa@example.com',
        password: await bcrypt.hash('password123', 10),
        firstName: 'Lisa',
        lastName: 'Taylor',
        role: 'user',
        status: 'suspended',
        verified: true,
        createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        lastLogin: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      }
    ];

    // แทรกข้อมูลลงฐานข้อมูล
    const createdUsers = await User.insertMany(sampleUsers);
    console.log(`✅ Created ${createdUsers.length} sample users successfully!`);

    // แสดงสถิติ
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ status: 'active' });
    const bannedUsers = await User.countDocuments({ status: 'banned' });
    const suspendedUsers = await User.countDocuments({ status: 'suspended' });
    const premiumUsers = await User.countDocuments({ role: 'premium' });
    const verifiedUsers = await User.countDocuments({ verified: true });

    console.log('\n📊 Database Statistics:');
    console.log(`- Total Users: ${totalUsers}`);
    console.log(`- Active Users: ${activeUsers}`);
    console.log(`- Banned Users: ${bannedUsers}`);
    console.log(`- Suspended Users: ${suspendedUsers}`);
    console.log(`- Premium Users: ${premiumUsers}`);
    console.log(`- Verified Users: ${verifiedUsers}`);

    console.log('\n🔍 Users by Status:');
    const users = await User.find().select('username email role status verified');
    users.forEach(user => {
      const statusIcon = user.status === 'active' ? '✅' : user.status === 'banned' ? '❌' : '⚠️';
      const verifiedIcon = user.verified ? '✓' : '✗';
      console.log(`- ${user.username} (${user.email}) - ${user.role} - ${user.status} ${statusIcon} ${verifiedIcon}`);
    });

  } catch (error) {
    console.error('❌ Error creating sample users:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n📴 Connection closed');
    process.exit(0);
  }
})
.catch(err => {
  console.error('❌ MongoDB Connection Error:', err);
  process.exit(1);
});
