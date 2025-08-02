const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ตรวจสอบว่ามี Token หรือไม่
exports.protect = async (req, res, next) => {
  let token;

  // ตรวจสอบ header ว่ามี Authorization ที่ขึ้นต้นด้วย Bearer หรือไม่
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // แยก token ออกจาก Bearer
    token = req.headers.authorization.split(' ')[1];
  } 
  // ตรวจสอบจาก cookies
  else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  // ตรวจสอบว่ามี token หรือไม่
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'กรุณาเข้าสู่ระบบก่อนใช้งาน'
    });
  }

  try {
    // ตรวจสอบ token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'sodeclicksecret2024');

    // ค้นหา user จาก token
    req.user = await User.findById(decoded.id);

    // อัปเดตเวลาล็อกอินล่าสุด
    await User.findByIdAndUpdate(decoded.id, { lastLogin: new Date() });

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Token ไม่ถูกต้องหรือหมดอายุ'
    });
  }
};

// ตรวจสอบสิทธิ์ของผู้ใช้
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'กรุณาเข้าสู่ระบบก่อนใช้งาน'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'คุณไม่มีสิทธิ์ในการเข้าถึงข้อมูลนี้'
      });
    }
    
    next();
  };
};
