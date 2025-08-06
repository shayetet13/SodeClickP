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
    // อัปเดตข้อมูลผู้ใช้ให้มีข้อมูลครบถ้วน
    const updates = [
      {
        email: 'emma@demo.com',
        data: {
          address: '123/45 ถ.สุขุมวิท กรุงเทพฯ 10110',
          occupation: 'นักออกแบบกราฟิก',
          phone: '081-234-5678',
          bio: 'สวัสดีค่ะ! ฉันเป็นนักออกแบบกราฟิกที่หลงใหลในการสร้างสรรค์งานศิลปะ รักการเดินทางและการถ่ายภาพ อยากหาคนที่มีความสนใจคล้ายกันมาร่วมสร้างความทรงจำดีๆ ด้วยกัน'
        }
      },
      {
        email: 'alex@demo.com',
        data: {
          address: '456/78 ถ.นิมมานเหมินท์ เชียงใหม่ 50200',
          occupation: 'เทรนเนอร์ส่วนตัว',
          phone: '089-876-5432',
          bio: 'สวัสดีครับ! ผมเป็นเทรนเนอร์ส่วนตัวที่รักการออกกำลังกายและการปรุงอาหารเพื่อสุขภาพ ชอบดูหนังและสร้างแรงบันดาลใจให้คนรอบข้าง อยากพบเจอคนที่รักการดูแลสุขภาพเหมือนกัน'
        }
      },
      {
        email: 'Tanachoklu@gmail.com',
        data: {
          address: '789/12 ถ.แสงชูโต นนทบุรี 11000',
          phone: '092-345-6789',
          bio: 'สวัสดีครับ! ผมทำงานด้านไอทีและหลงใหลในเทคโนโลยีใหม่ๆ ช่วงว่างชอบเล่นเกม ดูหนัง ฟังเพลง อยากหาคนที่สามารถแชร์ความสนใจและเติบโตไปด้วยกันได้'
        }
      },
      {
        email: 'shayetet14@protonmail.com',
        data: {
          address: '321/65 ถ.รัชดาภิเษก กรุงเทพฯ 10400',
          occupation: 'วิศวกรซอฟต์แวร์',
          phone: '084-567-8901',
          bio: 'สวัสดีครับ! ผมเป็นวิศวกรซอฟต์แวร์ที่สนใจเทคโนโลยี เกมมิ่ง และดนตรี ชอบเรียนรู้สิ่งใหม่ๆ และแชร์ความรู้ให้กับคนอื่น อยากหาคนที่มีวิสัยทัศน์และความฝันคล้ายกัน'
        }
      }
    ];

    for (const update of updates) {
      const result = await User.updateOne(
        { email: update.email },
        { $set: update.data }
      );
      
      if (result.modifiedCount > 0) {
        console.log(`✅ Updated profile data for ${update.email}`);
      } else {
        console.log(`❌ Could not find user: ${update.email}`);
      }
    }

    // แสดงผลลัพธ์
    const users = await User.find({ role: { $ne: 'admin' } })
      .select('firstName lastName location address occupation phone bio');
    
    console.log('\n👥 Updated user profiles:');
    users.forEach(user => {
      console.log(`\n📝 ${user.firstName} ${user.lastName}:`);
      console.log(`   📍 Location: ${user.location}`);
      console.log(`   🏠 Address: ${user.address || 'ไม่ระบุ'}`);
      console.log(`   💼 Occupation: ${user.occupation || 'ไม่ระบุ'}`);
      console.log(`   📱 Phone: ${user.phone || 'ไม่ระบุ'}`);
      console.log(`   📄 Bio: ${user.bio ? user.bio.substring(0, 50) + '...' : 'ไม่ระบุ'}`);
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
