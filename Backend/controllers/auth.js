const User = require('../models/User');
const bcrypt = require('bcryptjs');

// @desc    สมัครสมาชิกใหม่
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { username, email, password, firstName, lastName, phone } = req.body;

    // ตรวจสอบว่ามีผู้ใช้นี้ในระบบแล้วหรือไม่
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'อีเมลหรือชื่อผู้ใช้นี้มีในระบบแล้ว'
      });
    }

    // สร้างผู้ใช้ใหม่
    const user = await User.create({
      username,
      email,
      password,
      firstName,
      lastName,
      phone
    });

    // สร้าง token
    const token = user.getSignedJwtToken();

    res.status(201).json({
      success: true,
      message: 'สมัครสมาชิกสำเร็จ',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        verified: user.verified
      }
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการสมัครสมาชิก',
      error: err.message
    });
  }
};

// @desc    เข้าสู่ระบบ
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { identifier, password } = req.body;
    
    console.log('=== LOGIN ATTEMPT ===');
    console.log('Identifier:', identifier);
    console.log('Password provided:', password ? 'Yes' : 'No');

    // ตรวจสอบว่ามีข้อมูลครบหรือไม่
    if (!identifier || !password) {
      console.log('Missing credentials');
      return res.status(400).json({
        success: false,
        message: 'กรุณากรอกอีเมล/ชื่อผู้ใช้ และรหัสผ่าน'
      });
    }

    // ค้นหาผู้ใช้จากอีเมลหรือชื่อผู้ใช้ (case insensitive)
    console.log('Searching for user with identifier:', identifier);
    const user = await User.findOne({
      $or: [
        { email: { $regex: new RegExp(`^${identifier}$`, 'i') } }, 
        { username: { $regex: new RegExp(`^${identifier}$`, 'i') } }
      ]
    }).select('+password');
    
    console.log('User found:', user ? `${user.username} (${user.email}) - Role: ${user.role}` : 'No user found');

    // ตรวจสอบว่ามีผู้ใช้นี้ในระบบหรือไม่
    if (!user) {
      console.log('User not found in database');
      return res.status(401).json({
        success: false,
        message: 'อีเมล/ชื่อผู้ใช้ หรือรหัสผ่านไม่ถูกต้อง'
      });
    }

    console.log('Password field exists:', !!user.password);
    console.log('Password type:', typeof user.password);
    console.log('Password length:', user.password ? user.password.length : 0);

    // ตรวจสอบว่า password field มีข้อมูลหรือไม่
    if (!user.password || typeof user.password !== 'string' || user.password.length === 0) {
      console.log('Invalid password field - resetting...');
      
      // รีเซ็ตรหัสผ่านใหม่
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('root77', salt);
      
      await User.updateOne(
        { _id: user._id },
        { $set: { password: hashedPassword } }
      );
      
      console.log('Password reset for user:', user.username);
      
      // ดึงข้อมูล user ใหม่
      const updatedUser = await User.findById(user._id).select('+password');
      
      // ตรวจสอบรหัสผ่านใหม่
      const isMatch = await bcrypt.compare(password, updatedUser.password);
      
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'อีเมล/ชื่อผู้ใช้ หรือรหัสผ่านไม่ถูกต้อง'
        });
      }
      
      // ใช้ updated user สำหรับ response
      user.password = updatedUser.password;
    } else {
      // ตรวจสอบรหัสผ่านปกติ
      console.log('Comparing password directly with bcrypt...');
      let isMatch = false;
      try {
        isMatch = await bcrypt.compare(password, user.password);
        console.log('Direct bcrypt compare result:', isMatch);
      } catch (compareError) {
        console.error('Bcrypt compare error:', compareError);
        return res.status(500).json({
          success: false,
          message: 'เกิดข้อผิดพลาดในการตรวจสอบรหัสผ่าน'
        });
      }
      
      if (!isMatch) {
        console.log('Password does not match');
        return res.status(401).json({
          success: false,
          message: 'อีเมล/ชื่อผู้ใช้ หรือรหัสผ่านไม่ถูกต้อง'
        });
      }
    }

    console.log('Login successful for user:', user.username);

    // อัปเดตเวลาล็อกอินล่าสุด
    await User.updateOne(
      { _id: user._id },
      { $set: { lastLogin: new Date() } }
    );

    // สร้าง token
    const token = user.getSignedJwtToken();

    // กำหนดตัวเลือกสำหรับคุกกี้
    const options = {
      expires: new Date(
        Date.now() + (process.env.JWT_COOKIE_EXPIRE || 30) * 24 * 60 * 60 * 1000
      ),
      httpOnly: true
    };

    // เพิ่ม secure flag ถ้าเป็น production
    if (process.env.NODE_ENV === 'production') {
      options.secure = true;
    }

    console.log('Sending successful response');
    res.status(200)
      .cookie('token', token, options)
      .json({
        success: true,
        message: 'เข้าสู่ระบบสำเร็จ',
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          avatar: user.avatar,
          verified: user.verified
        }
      });
  } catch (err) {
    console.error('=== LOGIN ERROR ===');
    console.error('Error details:', err);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ',
      error: err.message
    });
  }
};

// @desc    ดึงข้อมูลผู้ใช้ปัจจุบัน
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        avatar: user.avatar,
        verified: user.verified,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }
    });
  } catch (err) {
    console.error('Get me error:', err);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้',
      error: err.message
    });
  }
};

// @desc    ออกจากระบบ
// @route   GET /api/auth/logout
// @access  Private
exports.logout = (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    message: 'ออกจากระบบสำเร็จ'
  });
};

// @desc    อัปเดตข้อมูลผู้ใช้
// @route   PUT /api/auth/updatedetails
// @access  Private
exports.updateDetails = async (req, res) => {
  try {
    const fieldsToUpdate = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      phone: req.body.phone
    };

    // กรองเอาเฉพาะฟิลด์ที่มีข้อมูล
    Object.keys(fieldsToUpdate).forEach(key => 
      fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
    );

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: 'อัปเดตข้อมูลสำเร็จ',
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        avatar: user.avatar
      }
    });
  } catch (err) {
    console.error('Update details error:', err);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล',
      error: err.message
    });
  }
};

// @desc    เปลี่ยนรหัสผ่าน
// @route   PUT /api/auth/updatepassword
// @access  Private
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'กรุณากรอกรหัสผ่านปัจจุบันและรหัสผ่านใหม่'
      });
    }

    const user = await User.findById(req.user.id).select('+password');

    // ตรวจสอบรหัสผ่านปัจจุบัน
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'รหัสผ่านปัจจุบันไม่ถูกต้อง'
      });
    }

    // ตั้งค่ารหัสผ่านใหม่
    user.password = newPassword;
    await user.save();

    // สร้าง token ใหม่
    const token = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      message: 'เปลี่ยนรหัสผ่านสำเร็จ',
      token
    });
  } catch (err) {
    console.error('Update password error:', err);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน',
      error: err.message
    });
  }
};
