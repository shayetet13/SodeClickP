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
    // เช็คว่า account shayetet14@protonmail.com มีอยู่หรือไม่
    const shayetetUser = await User.findOne({ 
      $or: [
        { email: 'shayetet14@protonmail.com' },
        { username: 'kao' },
        { username: 'shayetet14' }
      ]
    });
    
    if (shayetetUser) {
      console.log('✅ Found shayetet account:');
      console.log(`   - Username: ${shayetetUser.username}`);
      console.log(`   - Email: ${shayetetUser.email}`);
      console.log(`   - Name: ${shayetetUser.firstName} ${shayetetUser.lastName}`);
      console.log(`   - Status: ${shayetetUser.status}`);
      console.log(`   - Role: ${shayetetUser.role}`);
      console.log(`   - Verified: ${shayetetUser.verified}`);
    } else {
      console.log('❌ shayetet14@protonmail.com account not found!');
      console.log('Searching for any accounts with similar names...');
      
      const similarUsers = await User.find({
        $or: [
          { email: { $regex: 'shayetet', $options: 'i' } },
          { username: { $regex: 'kao', $options: 'i' } },
          { firstName: { $regex: 'kao', $options: 'i' } }
        ]
      });
      
      if (similarUsers.length > 0) {
        console.log('Found similar accounts:');
        similarUsers.forEach(user => {
          console.log(`   - ${user.username} (${user.email}) - ${user.firstName} ${user.lastName}`);
        });
      } else {
        console.log('No similar accounts found.');
      }
    }

    // แสดงรายชื่อทั้งหมด
    const allUsers = await User.find({}, 'username email firstName lastName role status verified');
    console.log('\n🔍 All Users in Database:');
    allUsers.forEach(user => {
      const statusIcon = user.status === 'active' ? '✅' : user.status === 'banned' ? '❌' : '⚠️';
      const verifiedIcon = user.verified ? '✓' : '✗';
      console.log(`- ${user.firstName} ${user.lastName} (${user.email}) - ${user.username} - ${user.role} - ${user.status} ${statusIcon} ${verifiedIcon}`);
    });

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
