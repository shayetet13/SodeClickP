const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

// ข้อมูลสำหรับสุ่ม
const thaiFirstNames = {
  male: [
    'สมชาย', 'สมศักดิ์', 'สมพงษ์', 'สมหมาย', 'วิชัย', 'วิโรจน์', 'ประยุทธ์', 'ประวิทย์', 
    'ไพโรจน์', 'ธีรพงษ์', 'ธนกร', 'ณัฐพล', 'นิรันดร์', 'กิตติ', 'กฤษณะ', 'คมสัน', 
    'จิรายุ', 'จักรพงษ์', 'ชยพล', 'ชาญ', 'ดนัย', 'ทศพร', 'ธนภัทร', 'นพดล', 'ปกรณ์',
    'ภูมิ', 'มานิต', 'ยศวรรธน์', 'รัชพล', 'ลิขิต', 'วสันต์', 'ศุภชัย', 'สิทธิ', 'สุชาติ',
    'อดิศักดิ์', 'อภิชาติ', 'เอกชัย', 'โอภาส', 'กรกช', 'เกียรติ', 'เจริญ', 'ชัยวัฒน์',
    'ดำรง', 'ธีระ', 'นิติ', 'บุญมี', 'ปัญญา', 'พิพัฒน์', 'มงคล', 'ยุทธ', 'รุ่งโรจน์',
    'วิทยา', 'ศิริ', 'สมบูรณ์', 'อนุพงษ์', 'เอื้อง'
  ],
  female: [
    'สมหญิง', 'สุภาพ', 'วารี', 'วาสนา', 'ปรานี', 'ประไพ', 'ปิยะ', 'พิมพ์', 'มาลี', 'ยุพิน',
    'รัชนี', 'ลัดดา', 'วันดี', 'สุนิสา', 'สิริ', 'อรุณี', 'แสงดาว', 'กัญญา', 'กุลณัฐ', 'จิรา',
    'ชลิดา', 'ณัฐชา', 'ณิชา', 'ดวงใจ', 'ทิพย์', 'นงค์', 'นิตยา', 'บุษบา', 'ปทุม', 'ปยดา',
    'พรรณี', 'พิมลพรรณ', 'มณี', 'ยุพา', 'รุ่งทิวา', 'ลักษณา', 'วิมล', 'ศิริพร', 'สุกัญญา',
    'สุภา', 'อรทัย', 'อุบล', 'เพ็ญ', 'กนกวรรณ', 'กาญจนา', 'เก็จมณี', 'จันทนา', 'ฉวีวรรณ',
    'ดารา', 'ธิดา', 'นภา', 'บุหลัน', 'ปราณี', 'ผกามาส', 'พัชรี', 'มณีรัตน์', 'ยุพาพร',
    'รพีพรรณ', 'ลลิตา', 'วิจิตรา', 'ศศิ', 'สุดา', 'อัจฉรา'
  ]
};

const thaiLastNames = [
  'จันทร์', 'ศรี', 'สวย', 'งาม', 'ดี', 'สุข', 'เจริญ', 'มั่งมี', 'รุ่งเรือง', 'เปลี่ยน',
  'ใจดี', 'สมบูรณ์', 'แก้ว', 'ทอง', 'เงิน', 'ขาว', 'ดำ', 'แดง', 'เขียว', 'น้ำเงิน'
];

const occupations = [
  'นักบัญชี', 'วิศวกร', 'แพทย์', 'พยาบาล', 'ครู', 'นักการตลาด', 'โปรแกรมเมอร์', 'นักกฎหมาย',
  'สถาปนิก', 'นักออกแบบ', 'นักข่าว', 'นักเขียน', 'ช่างภาพ', 'ศิลปิน', 'นักดนตรี', 'เชฟ'
];

const locations = [
  'กรุงเทพฯ', 'เชียงใหม่', 'ขอนแก่น', 'นครราชสีมา', 'พิษณุโลก', 'อุบลราชธานี', 'สุราษฎร์ธานี'
];

const interests = [
  'อ่านหนังสือ', 'ดูหนัง', 'ฟังเพลง', 'เที่ยว', 'ออกกำลังกาย', 'ทำอาหาร', 'ถ่ายรูป', 'วาดรูป'
];

// ฟังก์ชันสุ่มค่า
const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// ฟังก์ชันสร้างอีเมล
const generateEmail = (firstName, lastName, index) => {
  const domains = ['gmail.com', 'hotmail.com', 'yahoo.com'];
  // แปลงชื่อไทยเป็นตัวอักษรอังกฤษ
  const englishFirstNames = ['john', 'jane', 'mike', 'sara', 'david', 'lisa', 'tom', 'amy', 'alex', 'emma'];
  const englishLastNames = ['smith', 'brown', 'johnson', 'williams', 'jones', 'garcia', 'miller', 'davis', 'wilson', 'moore'];
  
  const randomFirst = englishFirstNames[Math.floor(Math.random() * englishFirstNames.length)];
  const randomLast = englishLastNames[Math.floor(Math.random() * englishLastNames.length)];
  
  return `${randomFirst}${randomLast}${index}@${getRandomElement(domains)}`;
};

// ฟังก์ชันสร้างผู้ใช้
const generateUser = (index) => {
  const gender = getRandomElement(['ชาย', 'หญิง']);
  const firstName = getRandomElement(thaiFirstNames[gender === 'ชาย' ? 'male' : 'female']);
  const lastName = getRandomElement(thaiLastNames);
  const age = getRandomNumber(18, 60);
  
  return {
    username: `${firstName}${lastName}${index}`,
    email: generateEmail(firstName, lastName, index),
    password: 'password123',
    firstName,
    lastName,
    nickname: firstName,
    phone: `08${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
    age,
    gender,
    sexualOrientation: getRandomElement(['ชอบเพศตรงข้าม', 'ชอบเพศเดียวกัน', 'ชอบทั้งสองเพศ']),
    weight: getRandomNumber(45, 120),
    bio: `ฉันเป็นคนที่ร่าเริงและชอบ${getRandomElement(interests)}`,
    location: getRandomElement(locations),
    occupation: getRandomElement(occupations),
    education: getRandomElement(['ปริญญาตรี', 'ปริญญาโท', 'มัธยมศึกษา']),
    interests: [getRandomElement(interests), getRandomElement(interests)],
    personalDetails: {
      height: getRandomNumber(150, 190),
      bodyType: getRandomElement(['ผอม', 'ปกติ', 'อวบ']),
      exercise: getRandomElement(['ไม่ออกกำลังกาย', 'ออกกำลังกายเป็นครั้งคราว', 'ออกกำลังกายสม่ำเสมอ']),
      children: getRandomElement(['ไม่มี', 'มี 1 คน', 'ต้องการมี'])
    },
    lifeStyle: {
      religion: getRandomElement(['พุทธ', 'คริสต์', 'ไม่นับถือศาสนา']),
      zodiac: getRandomElement(['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน'])
    },
    role: Math.random() > 0.9 ? 'premium' : 'user',
    status: 'active',
    verified: Math.random() > 0.7
  };
};

// ฟังก์ชันหลัก
const createUsers = async () => {
  try {
    console.log('🔄 เชื่อมต่อ MongoDB...');
    await mongoose.connect('mongodb+srv://shayetet14:sdg5NrhmPFak8T3y@cluster0.2g7xxjp.mongodb.net/love?retryWrites=true&w=majority&appName=Cluster0');
    console.log('✅ เชื่อมต่อ MongoDB สำเร็จ!');

    // ลบผู้ใช้เก่าทั้งหมด (ยกเว้น admin)
    const deleteResult = await User.deleteMany({ role: { $ne: 'admin' } });
    console.log(`🗑️  ลบผู้ใช้เก่า ${deleteResult.deletedCount} คน`);

    console.log('🚀 เริ่มสร้างผู้ใช้ 1000 คน...');
    
    let successCount = 0;
    let errorCount = 0;

    for (let i = 1; i <= 1000; i++) {
      try {
        const userData = generateUser(i);
        const user = new User(userData);
        await user.save();
        successCount++;
        
        if (i % 100 === 0) {
          console.log(`✅ สร้างผู้ใช้แล้ว ${successCount} คน (รอบที่ ${i})`);
        }
      } catch (error) {
        errorCount++;
        console.log(`❌ ข้อผิดพลาดในการสร้างผู้ใช้คนที่ ${i}: ${error.message}`);
      }
    }

    console.log(`\n🎉 เสร็จสิ้น! สร้างผู้ใช้สำเร็จ ${successCount} คน, ผิดพลาด ${errorCount} คน`);
    
    // สรุปข้อมูล
    const totalUsers = await User.countDocuments();
    const genderStats = await User.aggregate([
      { $group: { _id: '$gender', count: { $sum: 1 } } }
    ]);
    const roleStats = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    console.log(`\n📊 สรุปข้อมูลผู้ใช้ทั้งหมด: ${totalUsers} คน`);
    genderStats.forEach(stat => {
      console.log(`   ${stat._id}: ${stat.count} คน`);
    });
    console.log('\n👥 สรุปตามสมาชิกภาพ:');
    roleStats.forEach(stat => {
      console.log(`   ${stat._id}: ${stat.count} คน`);
    });

  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 ปิดการเชื่อมต่อ MongoDB');
    process.exit(0);
  }
};

// รันสคริปต์
createUsers();
