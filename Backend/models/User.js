const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  memberId: {
    type: String,
    unique: true,
    required: true
  },
  username: {
    type: String,
    required: [true, 'กรุณากรอกชื่อผู้ใช้'],
    unique: true,
    trim: true,
    minlength: [3, 'ชื่อผู้ใช้ต้องมีความยาวอย่างน้อย 3 ตัวอักษร'],
    maxlength: [50, 'ชื่อผู้ใช้ต้องมีความยาวไม่เกิน 50 ตัวอักษร']
  },
  email: {
    type: String,
    required: [true, 'กรุณากรอกอีเมล'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'กรุณากรอกอีเมลที่ถูกต้อง'
    ]
  },
  password: {
    type: String,
    required: [true, 'กรุณากรอกรหัสผ่าน'],
    minlength: [6, 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร'],
    select: false // เปลี่ยนเป็น false เพื่อความปลอดภัย
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'VIP', 'VIP1', 'VIP2', 'Gold', 'Silver', 'Diamond', 'Platinum'],
    default: 'user'
  },
  firstName: {
    type: String,
    trim: true
  },
  lastName: {
    type: String,
    trim: true
  },
  nickname: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  avatar: {
    type: String,
    default: '/uploads/avatar/default.png'
  },
  age: {
    type: Number
  },
  gender: {
    type: String,
    enum: ['ชาย', 'หญิง', 'อื่นๆ'],
    trim: true
  },
  sexualOrientation: {
    type: String,
    enum: ['ชอบเพศตรงข้าม', 'ชอบเพศเดียวกัน', 'ชอบทั้งสองเพศ', 'อื่นๆ'],
    trim: true
  },
  weight: {
    type: Number
  },
  bio: {
    type: String
  },
  selfDescription: {
    type: String
  },
  location: {
    type: String
  },
  address: {
    type: String
  },
  occupation: {
    type: String
  },
  education: {
    type: String
  },
  interests: [{
    type: String
  }],
  lookingFor: [{
    type: String
  }],
  // เพิ่มฟิลด์ที่ root level
  lifestyle: {
    type: String
  },
  smoking: {
    type: String,
    enum: ['ไม่สูบบุรี่', 'สูบเป็นครั้งคราว', 'สูบเป็นประจำ', 'เลิกแล้ว']
  },
  drinking: {
    type: String,
    enum: ['ไม่ดื่ม', 'ดื่มเป็นครั้งคราว', 'ดื่มเป็นประจำ', 'ดื่มในงานสังคม']
  },
  pets: [{
    type: String
  }],
  foodStyle: [{
    type: String
  }],
  favoriteMovies: [{
    type: String
  }],
  favoriteMusic: [{
    type: String
  }],
  funFacts: [{
    type: String
  }],
  relationshipGoal: {
    type: String
  },
  personalDetails: {
    height: Number,
    bodyType: String,
    exercise: String,
    children: String,
    languages: [String]
  },
  lifeStyle: {
    religion: String,
    zodiac: String,
    mbti: String,
    workLifeBalance: String
  },
  relationshipPreferences: {
    relationshipType: String,
    ageRange: {
      min: Number,
      max: Number
    },
    location: String,
    dealBreakers: [String]
  },
  // เพิ่ม idealMatch
  idealMatch: {
    personality: String,
    interests: String,
    lifestyle: String,
    ageRange: {
      min: Number,
      max: Number
    }
  },
  // Privacy Settings
  privacySettings: {
    hideAge: {
      type: Boolean,
      default: false
    },
    hideOccupation: {
      type: Boolean,
      default: false
    },
    hideLocation: {
      type: Boolean,
      default: false
    },
    hideLastSeen: {
      type: Boolean,
      default: false
    }
  },
  verified: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date
  },
  status: {
    type: String,
    enum: ['active', 'banned', 'suspended'],
    default: 'active'
  },
  bannedAt: {
    type: Date
  },
  banReason: {
    type: String
  }
});

// ลบ pre-save hook ที่อาจทำให้เกิดปัญหา
// UserSchema.pre('save', async function(next) {
//   if (!this.isModified('password')) {
//     return next();
//   }
//   
//   try {
//     if (this.password.startsWith('$2a$') || this.password.startsWith('$2b$')) {
//       console.log('Password is already hashed, skipping hash process');
//       return next();
//     }
//
//     console.log('Hashing password for user:', this.username);
//     const salt = await bcrypt.genSalt(10);
//     this.password = await bcrypt.hash(this.password, salt);
//     console.log('Password hashed successfully');
//     next();
//   } catch (error) {
//     console.error('Error hashing password:', error);
//     next(error);
//   }
// });

// แทนที่ด้วยฟังก์ชันที่ง่ายกว่า
UserSchema.pre('save', async function(next) {
  // สร้าง member ID อัตโนมัติถ้ายังไม่มี
  if (this.isNew && !this.memberId) {
    try {
      this.memberId = await generateMemberId(this.role);
    } catch (error) {
      console.error('Error generating member ID:', error);
      return next(error);
    }
  }

  if (!this.isModified('password')) {
    return next();
  }
  
  // ถ้ารหัสผ่านยังไม่ได้เข้ารหัส ให้เข้ารหัส
  if (!this.password.startsWith('$2')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  
  next();
});

// ฟังก์ชันสำหรับสร้าง member ID
async function generateMemberId(role) {
  const User = mongoose.model('User');
  
  // หา member ID ล่าสุด
  const lastUser = await User.findOne({}, { memberId: 1 })
    .sort({ memberId: -1 })
    .lean();
  
  let nextNumber = 1;
  
  if (lastUser && lastUser.memberId) {
    // ดึงตัวเลขจาก member ID (SD0000001 -> 1)
    const currentNumber = parseInt(lastUser.memberId.replace('SD', ''));
    nextNumber = currentNumber + 1;
  }
  
  // สร้าง member ID ใหม่ (รูปแบบ SD0000001, SD0000002, ...)
  const memberId = `SD${nextNumber.toString().padStart(7, '0')}`;
  
  return memberId;
}

// เช็ครหัสผ่าน - ปรับปรุงให้ใช้งานได้ดีขึ้น
UserSchema.methods.matchPassword = async function(enteredPassword) {
  try {
    return await bcrypt.compare(enteredPassword, this.password);
  } catch (error) {
    console.error('Error comparing password:', error);
    return false;
  }
};

// สร้าง JWT Token
UserSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { id: this._id, username: this.username, role: this.role },
    process.env.JWT_SECRET || 'sodeclicksecret2024',
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

module.exports = mongoose.model('User', UserSchema);
