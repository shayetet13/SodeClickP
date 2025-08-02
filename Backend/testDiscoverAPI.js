const mongoose = require('mongoose');
const User = require('./models/User');

// เพิ่ม log เพื่อดู API response
const authMiddleware = require('./middleware/auth');

mongoose.connect('mongodb+srv://admin:admin@cluster0.2g7xxjp.mongodb.net/love?retryWrites=true&w=majority')
.then(async () => {
  console.log('🔍 Testing Discover API Response:');
  
  // จำลอง discover API call
  const users = await User.find({
    role: { $ne: 'admin' },
    verified: true,
    status: 'active'
  })
  .select('firstName lastName age location occupation address avatar interests verified createdAt')
  .limit(15)
  .sort({ createdAt: -1 });

  console.log(`📊 Found ${users.length} users`);
  
  const formattedUsers = users.map(user => {
    let avatarUrl = '/uploads/avatar/default.png';
    
    if (user.avatar) {
      if (user.avatar.startsWith('http')) {
        avatarUrl = user.avatar;
      } else if (user.avatar.startsWith('/uploads')) {
        avatarUrl = `http://localhost:5000${user.avatar}`;
      } else {
        avatarUrl = `http://localhost:5000/uploads/avatar/${user.avatar}`;
      }
    }

    return {
      id: user._id,
      name: `${user.firstName} ${user.lastName}`,
      age: user.age || 25,
      location: user.location || 'ไม่ระบุ',
      occupation: user.occupation || 'ไม่ระบุ',
      address: user.address || 'ไม่ระบุ',
      avatar: avatarUrl,
      interests: user.interests || ['Music', 'Travel'],
      verified: user.verified || false,
      status: "ออนไลน์"
    };
  });

  console.log('📋 API Response Sample:');
  formattedUsers.forEach((user, index) => {
    console.log(`👤 User ${index + 1}:`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Location: ${user.location}`);
    console.log(`   Occupation: '${user.occupation}'`);
    console.log(`   Address: '${user.address}'`);
    console.log('   ---');
  });

  process.exit(0);
})
.catch(err => {
  console.error('Database connection error:', err);
  process.exit(1);
});
