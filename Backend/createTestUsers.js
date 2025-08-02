const mongoose = require('mongoose');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect('mongodb+srv://shayetet14:sdg5NrhmPFak8T3y@cluster0.2g7xxjp.mongodb.net/love?retryWrites=true&w=majority&appName=Cluster0');

async function createTestPremiumUsers() {
  try {
    console.log('Creating test premium users...');

    const testUsers = [
      {
        username: 'premium_user1',
        email: 'premium1@example.com',
        firstName: 'สมชาย',
        lastName: 'ใจดี',
        role: 'premium'
      },
      {
        username: 'premium_user2', 
        email: 'premium2@example.com',
        firstName: 'สมหญิง',
        lastName: 'รักใคร',
        role: 'premium'
      },
      {
        username: 'premium_user3',
        email: 'premium3@example.com', 
        firstName: 'วิชัย',
        lastName: 'มีทรัพย์',
        role: 'premium'
      },
      {
        username: 'test_premium',
        email: 'test@premium.com',
        firstName: 'ทดสอบ',
        lastName: 'พรีเมี่ยม',
        role: 'premium'
      }
    ];

    for (let userData of testUsers) {
      const existingUser = await User.findOne({ 
        $or: [
          { email: userData.email },
          { username: userData.username }
        ]
      });

      if (!existingUser) {
        const newUser = new User({
          ...userData,
          password: 'hashedpassword123', // This should be properly hashed
          isVerified: true,
          lastLogin: new Date()
        });
        
        await newUser.save();
        console.log(`Created user: ${userData.username}`);
      } else {
        // Update existing user to premium
        await User.findByIdAndUpdate(existingUser._id, { role: 'premium' });
        console.log(`Updated ${existingUser.username} to premium`);
      }
    }

    console.log('Test users created/updated successfully!');
    
    // Show current premium users
    const premiumUsers = await User.find({ role: 'premium' }).select('username email firstName lastName');
    console.log('Current premium users:', premiumUsers);
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating test users:', error);
    process.exit(1);
  }
}

createTestPremiumUsers();
