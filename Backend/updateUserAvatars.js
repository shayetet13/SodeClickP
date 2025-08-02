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
    // อัปเดต avatar ให้ผู้ใช้แต่ละคน
    const updates = [
      {
        name: 'Emma Wilson',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612ade0?w=400&h=400&fit=crop&crop=face'
      },
      {
        name: 'Alex Johnson', 
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face'
      },
      {
        name: 'Tanachok Luevanichakul',
        avatar: 'https://images.unsplash.com/photo-1539571696-8d0bca9d1b72?w=400&h=400&fit=crop&crop=face'
      },
      {
        name: 'Kao Shayetet',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop&crop=face'
      }
    ];

    for (const update of updates) {
      const [firstName, lastName] = update.name.split(' ');
      const result = await User.updateOne(
        { firstName: firstName, lastName: lastName || firstName },
        { $set: { avatar: update.avatar } }
      );
      
      if (result.modifiedCount > 0) {
        console.log(`✅ Updated avatar for ${update.name}`);
      } else {
        console.log(`❌ Could not find user: ${update.name}`);
      }
    }

    // แสดงผลลัพธ์
    const users = await User.find({ role: { $ne: 'admin' } })
      .select('firstName lastName avatar');
    
    console.log('\n👥 Updated user avatars:');
    users.forEach(user => {
      console.log(`- ${user.firstName} ${user.lastName}: ${user.avatar}`);
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
