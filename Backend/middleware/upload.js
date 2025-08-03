const multer = require('multer');
const path = require('path');
const fs = require('fs');

// สร้างโฟลเดอร์ถ้ายังไม่มี
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// กำหนดที่เก็บไฟล์และชื่อไฟล์
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const userId = req.body.userId || req.params.userId;
    
    if (!userId) {
      return cb(new Error('User ID is required'), null);
    }

    // สร้างเส้นทางโฟลเดอร์สำหรับแต่ละ user
    const uploadPath = path.join(__dirname, '..', 'uploads', 'avatar', `user_${userId}`);
    
    // สร้างโฟลเดอร์ถ้ายังไม่มี
    ensureDirectoryExists(uploadPath);
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const userId = req.body.userId || req.params.userId;
    const isProfilePicture = req.body.isProfile === 'true';
    
    // ตรวจสอบประเภทไฟล์
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (!mimetype || !extname) {
      return cb(new Error('Only image files are allowed'), null);
    }
    
    const fileExtension = path.extname(file.originalname);
    
    if (isProfilePicture) {
      // รูป profile หลัก
      cb(null, `profile${fileExtension}`);
    } else {
      // รูปเพิ่มเติม - ใช้ timestamp เพื่อไม่ให้ซ้ำ
      const timestamp = Date.now();
      cb(null, `photo_${timestamp}${fileExtension}`);
    }
  }
});

// กำหนดขนาดไฟล์สูงสุด (5MB)
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: function (req, file, cb) {
    // ตรวจสอบประเภทไฟล์อีกครั้ง
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, JPG, PNG, GIF, WebP) are allowed'));
    }
  }
});

module.exports = upload;
