const express = require('express');
const {
  register,
  login,
  getMe,
  logout,
  updateDetails,
  updatePassword
} = require('../controllers/auth');
const { protect } = require('../middleware/auth');

const router = express.Router();

// สมัครสมาชิกใหม่
router.post('/register', register);

// เข้าสู่ระบบ
router.post('/login', login);

// ออกจากระบบ
router.get('/logout', logout);

// ดึงข้อมูลผู้ใช้ปัจจุบัน
router.get('/me', protect, getMe);

// อัปเดตข้อมูลผู้ใช้
router.put('/updatedetails', protect, updateDetails);

// เปลี่ยนรหัสผ่าน
router.put('/updatepassword', protect, updatePassword);

module.exports = router;
