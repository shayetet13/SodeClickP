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
  'ใจดี', 'สมบูรณ์', 'แก้ว', 'ทอง', 'เงิน', 'ขาว', 'ดำ', 'แดง', 'เขียว', 'น้ำเงิน',
  'บุญ', 'กุศล', 'ธรรม', 'ศักดิ์', 'สิทธิ์', 'วงศ์', 'โชติ', 'วิทย์', 'ชาติ', 'พงษ์',
  'รัตน์', 'มณี', 'พูล', 'สาย', 'วรรณ', 'ประสิทธิ์', 'ภูมิ', 'อยู่', 'มี', 'เป็น',
  'คง', 'ตั้ง', 'ลิ้ม', 'ชิม', 'ลิง', 'ช้าง', 'เสือ', 'หมี', 'กบ', 'ปลา'
];

const occupations = [
  'นักบัญชี', 'วิศวกร', 'แพทย์', 'พยาบาล', 'ครู', 'นักการตลาด', 'โปรแกรมเมอร์', 'นักกฎหมาย',
  'สถาปนิก', 'นักออกแบบ', 'นักข่าว', 'นักเขียน', 'นักแปล', 'นักวิจัย', 'นักวิทยาศาสตร์',
  'ช่างภาพ', 'ศิลปิน', 'นักดนตรี', 'นักแสดง', 'ผู้กำกับ', 'เชฟ', 'บาริสต้า', 'นักธุรกิจ',
  'พนักงานขาย', 'ที่ปรึกษา', 'นักวิเคราะห์', 'นักจิตวิทยา', 'นักสังคมสงเคราะห์', 'เภสัชกร',
  'ทันตแพทย์', 'สัตวแพทย์', 'นักกายภาพบำบัด', 'นักโภชนาการ', 'นักกีฬา', 'เทรนเนอร์',
  'ไกด์ท่องเที่ยว', 'นักบิน', 'แอร์โฮสเตส', 'ตำรวจ', 'ทหาร', 'ดับเพลิง', 'พนักงานราชการ'
];

const locations = [
  'กรุงเทพฯ', 'เชียงใหม่', 'ขอนแก่น', 'นครราชสีมา', 'พิษณุโลก', 'อุบลราชธานี', 'สุราษฎร์ธานี',
  'หาดใหญ่', 'นครศรีธรรมราช', 'เชียงราย', 'อุดรธานี', 'ลำปาง', 'น่าน', 'แม่ฮ่องสอน',
  'ตาก', 'สุโขทัย', 'กำแพงเพชร', 'พิจิตร', 'เพชรบูรณ์', 'ลพบุรี', 'ชัยนาท', 'สิงห์บุรี',
  'อ่างทอง', 'สระบุรี', 'นครนายก', 'ปราจีนบุรี', 'ฉะเชิงเทรา', 'ชลบุรี', 'ระยอง', 'จันทบุรี',
  'ตราด', 'ราชบุรี', 'เพชรบุรี', 'ประจุวบคีรีขันธ์', 'กาญจนบุรี', 'สุพรรณบุรี'
];

const interests = [
  'อ่านหนังสือ', 'ดูหนัง', 'ฟังเพลง', 'เที่ยว', 'ออกกำลังกาย', 'ทำอาหาร', 'ถ่ายรูป', 'วาดรูป',
  'เล่นดนตรี', 'ร้องเพลง', 'เต้นรำ', 'แต่งหน้า', 'แต่งบ้าน', 'ปลูกต้นไม้', 'เลี้ยงสัตว์',
  'เล่นเกม', 'ดูอนิเมะ', 'อ่านการ์ตูน', 'ช้อปปิ้ง', 'คาราโอเกะ', 'สปา', 'นวด', 'โยคะ',
  'ปั่นจักรยาน', 'วิ่ง', 'ว่ายน้ำ', 'เล่นเทนนิส', 'เล่นแบดมินตัน', 'เล่นกอล์ฟ', 'ปีนเขา',
  'ตกปลา', 'เดินป่า', 'แคมปิ้ง', 'สะสมของ', 'งานฝีมือ', 'เรียนภาษา', 'เรียนทำอาหาร'
];

const bodyTypes = ['ผอม', 'ปกติ', 'อวบ', 'นักกีฬา', 'เล็ก', 'กำยำ', 'ตัวเล็ก', 'ตัวใหญ่'];
const exercises = ['ไม่ออกกำลังกาย', 'ออกกำลังกายเป็นครั้งคราว', 'ออกกำลังกายสม่ำเสมอ', 'ออกกำลังกายทุกวัน', 'นักกีฬามืออาชีพ'];
const religions = ['พุทธ', 'คริสต์', 'อิสลาม', 'ฮินดู', 'ไม่นับถือศาสนา', 'อื่นๆ'];
const zodiacs = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
const mbtiTypes = ['INTJ', 'INTP', 'ENTJ', 'ENTP', 'INFJ', 'INFP', 'ENFJ', 'ENFP', 'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ', 'ISTP', 'ISFP', 'ESTP', 'ESFP'];

// ฟังก์ชันสุ่มค่า
const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomElements = (arr, count) => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};
const getRandomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// ฟังก์ชันสร้างอีเมล
const generateEmail = (firstName, lastName) => {
  const domains = ['gmail.com', 'hotmail.com', 'yahoo.com', 'outlook.com', 'icloud.com'];
  // แปลงชื่อไทยเป็นตัวอักษรอังกฤษ
  const englishFirstNames = ['john', 'jane', 'mike', 'sara', 'david', 'lisa', 'tom', 'amy', 'alex', 'emma'];
  const englishLastNames = ['smith', 'brown', 'johnson', 'williams', 'jones', 'garcia', 'miller', 'davis', 'wilson', 'moore'];
  
  const randomFirst = englishFirstNames[Math.floor(Math.random() * englishFirstNames.length)];
  const randomLast = englishLastNames[Math.floor(Math.random() * englishLastNames.length)];
  const randomNum = Math.floor(Math.random() * 99999);
  
  return `${randomFirst}${randomLast}${randomNum}@${getRandomElement(domains)}`;
};

// ฟังก์ชันสร้างเบอร์โทร
const generatePhone = () => {
  const prefixes = ['08', '09', '06'];
  const prefix = getRandomElement(prefixes);
  const number = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
  return prefix + number;
};

// ฟังก์ชันสร้างบายโอ
const generateBio = (gender, interests) => {
  const bios = {
    male: [
      'หาคนที่ใช่สำหรับชีวิต',
      'ชอบท่องเที่ยวและค้นหาประสบการณ์ใหม่ๆ',
      'รักความสนุกและมีอารมณ์ขัน',
      'มองหาคนที่จริงใจและเข้าใจกัน',
      'ชื่นชอบธรรมชาติและกิจกรรมกลางแจ้ง'
    ],
    female: [
      'หาคนที่เข้าใจและให้ความรัก',
      'รักการผจญภัยและสิ่งใหม่ๆ',
      'ชอบความเรียบง่ายและความอบอุ่น',
      'มองหาความรักที่แท้จริง',
      'รักสัตว์และธรรมชาติ'
    ]
  };
  
  const baseBio = getRandomElement(bios[gender === 'ชาย' ? 'male' : 'female']);
  const interestText = interests.length > 0 ? ` ชอบ${interests.slice(0, 3).join(', ')}` : '';
  
  return baseBio + interestText;
};

// ฟังก์ชันสร้างผู้ใช้
const generateUser = () => {
  const gender = getRandomElement(['ชาย', 'หญิง']);
  const firstName = getRandomElement(thaiFirstNames[gender === 'ชาย' ? 'male' : 'female']);
  const lastName = getRandomElement(thaiLastNames);
  const userInterests = getRandomElements(interests, getRandomNumber(3, 8));
  const age = getRandomNumber(18, 60);
  
  return {
    username: `${firstName}${lastName}${getRandomNumber(100, 999)}`,
    email: generateEmail(firstName, lastName),
    password: 'password123', // รหัสผ่านเริ่มต้น
    firstName,
    lastName,
    nickname: firstName,
    phone: generatePhone(),
    age,
    gender,
    sexualOrientation: getRandomElement(['ชอบเพศตรงข้าม', 'ชอบเพศเดียวกัน', 'ชอบทั้งสองเพศ']),
    weight: getRandomNumber(45, 120),
    bio: generateBio(gender, userInterests),
    selfDescription: `ฉันเป็นคนที่${getRandomElement(['ร่าเริง', 'เป็นกันเอง', 'อ่อนโยน', 'ใจดี', 'มีอารมณ์ขัน', 'จริงใจ'])} และชอบ${userInterests.slice(0, 2).join(' และ ')}`,
    location: getRandomElement(locations),
    address: `${getRandomNumber(1, 999)} ถนน${getRandomElement(['สุขุมวิท', 'รัชดาภิเษก', 'พระราม', 'ศรีนครินทร์', 'ลาดพร้าว'])}`,
    occupation: getRandomElement(occupations),
    education: getRandomElement(['มัธยมศึกษา', 'ปริญญาตรี', 'ปริญญาโท', 'ปริญญาเอก', 'อนุปริญญา']),
    interests: userInterests,
    lookingFor: getRandomElements(['ความรัก', 'มิตรภาพ', 'การแต่งงาน', 'คู่คิด', 'คู่ใจ'], getRandomNumber(1, 3)),
    lifestyle: getRandomElement(['เรียบง่าย', 'สนุกสนาน', 'หรูหรา', 'ผ่อนคลาย', 'ลำลอง']),
    smoking: getRandomElement(['ไม่สูบบุรี่', 'สูบเป็นครั้งคราว', 'สูบเป็นประจำ', 'เลิกแล้ว']),
    drinking: getRandomElement(['ไม่ดื่ม', 'ดื่มเป็นครั้งคราว', 'ดื่มเป็นประจำ', 'ดื่มในงานสังคม']),
    pets: getRandomElements(['แมว', 'หมา', 'นก', 'ปลา', 'หนู', 'กบ'], getRandomNumber(0, 2)),
    foodStyle: getRandomElements(['อาหารไทย', 'อาหารญี่ปุ่น', 'อาหารอิตาเลียน', 'อาหารจีน', 'อาหารเกาหลี', 'อาหารมังสวิรัติ'], getRandomNumber(1, 3)),
    favoriteMovies: getRandomElements(['แอคชั่น', 'โรแมนติก', 'คอมเมดี้', 'ดราม่า', 'สยองขวัญ', 'แฟนตาซี'], getRandomNumber(1, 3)),
    favoriteMusic: getRandomElements(['ป๊อป', 'ร็อค', 'แจ๊ส', 'คลาสสิค', 'อินดี้', 'เพลงไทย'], getRandomNumber(1, 3)),
    funFacts: [
      getRandomElement([
        'ฉันเป็นคนซ้าย',
        'ฉันชอบดูพระอาทิตย์ตก',
        'ฉันเป็นคนกลัวความสูง',
        'ฉันชอบเสียงฝน',
        'ฉันเคยเดินทางไปต่างประเทศแล้ว 5 ประเทศ'
      ])
    ],
    relationshipGoal: getRandomElement(['หาแฟน', 'แต่งงาน', 'หาเพื่อน', 'สนุกสนาน']),
    personalDetails: {
      height: getRandomNumber(150, 190),
      bodyType: getRandomElement(bodyTypes),
      exercise: getRandomElement(exercises),
      children: getRandomElement(['ไม่มี', 'มี 1 คน', 'มี 2 คน', 'ต้องการมี', 'ไม่ต้องการ']),
      languages: getRandomElements(['ไทย', 'อังกฤษ', 'จีน', 'ญี่ปุ่น', 'เกาหลี', 'ฝรั่งเศส'], getRandomNumber(1, 3))
    },
    lifeStyle: {
      religion: getRandomElement(religions),
      zodiac: getRandomElement(zodiacs),
      mbti: getRandomElement(mbtiTypes),
      workLifeBalance: getRandomElement(['สมดุล', 'เน้นงาน', 'เน้นชีวิต', 'ยืดหยุ่น'])
    },
    relationshipPreferences: {
      relationshipType: getRandomElement(['คบหา', 'แต่งงาน', 'เพื่อน', 'ไม่แน่ใจ']),
      ageRange: {
        min: Math.max(18, age - 10),
        max: Math.min(60, age + 10)
      },
      location: getRandomElement(locations),
      dealBreakers: getRandomElements(['โกหก', 'สูบบุรี่', 'ดื่มมาก', 'ไม่ซื่อสัตย์', 'ไม่มีงาน'], getRandomNumber(1, 3))
    },
    idealMatch: {
      personality: getRandomElement(['ร่าเริง', 'ใจดี', 'มีอารมณ์ขัน', 'จริงใจ', 'เข้าใจง่าย']),
      interests: getRandomElements(interests, getRandomNumber(2, 4)).join(', '),
      lifestyle: getRandomElement(['เรียบง่าย', 'สนุกสนาน', 'ผ่อนคลาย']),
      ageRange: {
        min: Math.max(18, age - 5),
        max: Math.min(60, age + 5)
      }
    },
    privacySettings: {
      hideAge: Math.random() > 0.8,
      hideOccupation: Math.random() > 0.9,
      hideLocation: Math.random() > 0.85,
      hideLastSeen: Math.random() > 0.7
    },
    verified: Math.random() > 0.7,
    role: Math.random() > 0.9 ? 'premium' : 'user',
    status: 'active',
    lastLogin: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // ภายใน 30 วันที่ผ่านมา
  };
};

// ฟังก์ชันหลักสำหรับสร้างผู้ใช้
const createUsers = async () => {
  try {
    // เชื่อมต่อ MongoDB
    await mongoose.connect('mongodb+srv://shayetet14:sdg5NrhmPFak8T3y@cluster0.2g7xxjp.mongodb.net/love?retryWrites=true&w=majority&appName=Cluster0', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('🔗 เชื่อมต่อ MongoDB สำเร็จ!');

    // ตรวจสอบผู้ใช้ที่มีอยู่แล้ว
    const existingUsers = await User.countDocuments();
    console.log(`� พบผู้ใช้ที่มีอยู่แล้ว: ${existingUsers} คน`);

    const users = [];
    const batchSize = 100;
    const newUsersToCreate = 1000;

    console.log('🚀 เริ่มสร้างผู้ใช้ 1000 คน...');

    for (let i = 0; i < newUsersToCreate; i += batchSize) {
      const batch = [];
      const remaining = Math.min(batchSize, newUsersToCreate - i);
      
      for (let j = 0; j < remaining; j++) {
        batch.push(generateUser());
      }

      try {
        const createdUsers = await User.insertMany(batch, { ordered: false });
        users.push(...createdUsers);
        console.log(`✅ สร้างผู้ใช้แล้ว ${i + remaining}/${newUsersToCreate} คน`);
      } catch (error) {
        console.log(`⚠️  เกิดข้อผิดพลาดในการสร้างผู้ใช้ครั้งที่ ${i + 1}-${i + remaining}: ${error.message}`);
        // ลองสร้างทีละคน
        for (const userData of batch) {
          try {
            const user = new User(userData);
            const savedUser = await user.save();
            users.push(savedUser);
            console.log(`✅ สร้างผู้ใช้ ${userData.username} สำเร็จ`);
          } catch (singleError) {
            console.log(`❌ ไม่สามารถสร้างผู้ใช้ ${userData.username}: ${singleError.message}`);
          }
        }
      }
    }

    console.log(`🎉 สร้างผู้ใช้ใหม่สำเร็จ ${users.length} คน!`);
    
    // สรุปข้อมูลทั้งหมด (รวมผู้ใช้เก่าด้วย)
    const totalUsers = await User.countDocuments();
    console.log(`📊 จำนวนผู้ใช้ทั้งหมดในระบบ: ${totalUsers} คน (เก่า ${existingUsers} + ใหม่ ${users.length})`);
    
    const genderCount = await User.aggregate([
      { $group: { _id: '$gender', count: { $sum: 1 } } }
    ]);
    
    const roleCount = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    console.log('\n📊 สรุปข้อมูลผู้ใช้:');
    genderCount.forEach(item => {
      console.log(`   ${item._id}: ${item.count} คน`);
    });
    
    console.log('\n👥 สรุปตามสมาชิกภาพ:');
    roleCount.forEach(item => {
      console.log(`   ${item._id}: ${item.count} คน`);
    });

    console.log('\n✨ เสร็จสิ้นการสร้างผู้ใช้!');
    
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
