const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// ตั้งค่า storage สำหรับ multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // สร้างโฟลเดอร์สำหรับเก็บรูปภาพของ user
    const userId = req.user.id;
    const userUploadsPath = path.join(__dirname, '..', 'uploads', 'users', userId);
    
    if (!fs.existsSync(userUploadsPath)) {
      fs.mkdirSync(userUploadsPath, { recursive: true });
    }
    
    cb(null, userUploadsPath);
  },
  filename: function (req, file, cb) {
    const fileExt = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    
    // ถ้าเป็นรูปโปรไฟล์หลัก ให้ใช้ชื่อ profile + extension
    if (req.body.isProfilePicture === 'true') {
      cb(null, 'profile' + fileExt);
    } else {
      cb(null, 'photo-' + uniqueSuffix + fileExt);
    }
  }
});

// ตั้งค่า filter สำหรับ multer เพื่อยอมรับเฉพาะรูปภาพ
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only images are allowed'));
  }
};

// กำหนดขนาดไฟล์สูงสุด 5MB
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

// @route   GET /api/profile
// @desc    Get current user profile
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบข้อมูลผู้ใช้'
      });
    }
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error getting profile:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลโปรไฟล์',
      error: error.message
    });
  }
});

// @route   PUT /api/profile
// @desc    Update user profile
// @access  Private
router.put('/', protect, async (req, res) => {
  try {
    console.log('Update profile API called');
    console.log('Request body:', req.body);
    console.log('User ID:', req.user.id);
    
    // Debug logging สำหรับฟิลด์ใหม่
    console.log('Destructured values:');
    console.log('lifestyle:', req.body.lifestyle);
    console.log('smoking:', req.body.smoking);
    console.log('drinking:', req.body.drinking);
    console.log('pets:', req.body.pets);
    console.log('foodStyle:', req.body.foodStyle);
    
    const {
      firstName,
      lastName,
      nickname,
      age,
      gender,
      sexualOrientation,
      weight,
      phone,
      bio,
      selfDescription,
      location,
      address, // เพิ่ม address
      occupation,
      education,
      interests,
      lookingFor,
      personalDetails,
      lifeStyle,
      relationshipPreferences,
      // เพิ่มฟิลด์ใหม่
      lifestyle,
      smoking,
      drinking,
      pets,
      foodStyle,
      favoriteMovies,
      favoriteMusic,
      funFacts,
      relationshipGoal,
      idealMatch
    } = req.body;
    
    // สร้าง object สำหรับ fields ที่จะอัพเดท
    const updateFields = {};
    
    // เพิ่ม fields ที่ส่งมา (รวมถึงการเคลียร์ข้อมูล)
    if (firstName !== undefined) updateFields.firstName = firstName;
    if (lastName !== undefined) updateFields.lastName = lastName;
    if (nickname !== undefined) updateFields.nickname = nickname;
    if (age !== undefined) updateFields.age = age;
    if (gender !== undefined) updateFields.gender = gender;
    if (sexualOrientation !== undefined) updateFields.sexualOrientation = sexualOrientation;
    if (weight !== undefined) updateFields.weight = weight;
    if (phone !== undefined) updateFields.phone = phone;
    if (bio !== undefined) updateFields.bio = bio;
    if (selfDescription !== undefined) updateFields.selfDescription = selfDescription;
    if (location !== undefined) updateFields.location = location;
    if (address !== undefined) updateFields.address = address; // เพิ่ม address
    if (occupation !== undefined) updateFields.occupation = occupation;
    if (education !== undefined) updateFields.education = education;
    if (interests !== undefined) updateFields.interests = interests;
    if (lookingFor !== undefined) updateFields.lookingFor = lookingFor;
    if (personalDetails !== undefined) updateFields.personalDetails = personalDetails;
    if (lifeStyle !== undefined) updateFields.lifeStyle = lifeStyle;
    if (relationshipPreferences !== undefined) updateFields.relationshipPreferences = relationshipPreferences;
    
    // เพิ่มฟิลด์ใหม่
    if (lifestyle !== undefined) updateFields.lifestyle = lifestyle;
    if (smoking !== undefined) updateFields.smoking = smoking;
    if (drinking !== undefined) updateFields.drinking = drinking;
    if (pets !== undefined) updateFields.pets = pets;
    if (foodStyle !== undefined) updateFields.foodStyle = foodStyle;
    if (favoriteMovies !== undefined) updateFields.favoriteMovies = favoriteMovies;
    if (favoriteMusic !== undefined) updateFields.favoriteMusic = favoriteMusic;
    if (funFacts !== undefined) updateFields.funFacts = funFacts;
    if (relationshipGoal !== undefined) updateFields.relationshipGoal = relationshipGoal;
    if (idealMatch !== undefined) updateFields.idealMatch = idealMatch;
    
    console.log('Update fields:', updateFields);
    
    // อัพเดทข้อมูลใน database
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select('-password');
    
    console.log('Updated user:', updatedUser);
    
    res.json({
      success: true,
      message: 'อัพเดทโปรไฟล์เรียบร้อยแล้ว',
      data: updatedUser
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการอัพเดทโปรไฟล์',
      error: error.message
    });
  }
});

// @route   POST /api/profile/upload
// @desc    Upload profile photo
// @access  Private
router.post('/upload', protect, upload.single('photo'), async (req, res) => {
  try {
    console.log('📷 Upload request received');
    console.log('User ID:', req.user.id);
    console.log('File info:', req.file ? {
      filename: req.file.filename,
      path: req.file.path,
      size: req.file.size
    } : 'No file');
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'ไม่มีไฟล์รูปภาพ'
      });
    }
    
    const userId = req.user.id;
    const filePath = `/uploads/users/${userId}/${req.file.filename}`;
    
    console.log('📂 File path:', filePath);
    console.log('💾 File saved to:', req.file.path);
    
    // ถ้าเป็นรูปโปรไฟล์หลัก ให้อัพเดท field avatar ใน user
    if (req.body.isProfilePicture === 'true') {
      await User.findByIdAndUpdate(userId, { avatar: filePath });
    }
    
    res.json({
      success: true,
      message: 'อัพโหลดรูปภาพเรียบร้อยแล้ว',
      data: {
        filePath,
        filename: req.file.filename,
        isProfilePicture: req.body.isProfilePicture === 'true'
      }
    });
  } catch (error) {
    console.error('Error uploading photo:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการอัพโหลดรูปภาพ',
      error: error.message
    });
  }
});

// @route   POST /api/profile/upload-multiple
// @desc    Upload multiple photos
// @access  Private
router.post('/upload-multiple', protect, upload.array('photos', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'ไม่มีไฟล์รูปภาพ'
      });
    }
    
    const userId = req.user.id;
    const uploadedFiles = req.files.map(file => ({
      filePath: `/uploads/users/${userId}/${file.filename}`,
      filename: file.filename
    }));
    
    res.json({
      success: true,
      message: `อัพโหลดรูปภาพ ${req.files.length} รูปเรียบร้อยแล้ว`,
      data: uploadedFiles
    });
  } catch (error) {
    console.error('Error uploading multiple photos:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการอัพโหลดรูปภาพ',
      error: error.message
    });
  }
});

// @route   GET /api/profile/photos
// @desc    Get all user photos
// @access  Private
router.get('/photos', protect, async (req, res) => {
  try {
    console.log('📷 Getting photos for user:', req.user.id);
    const userId = req.user.id;
    const userUploadsPath = path.join(__dirname, '..', 'uploads', 'users', userId);
    console.log('📂 Looking for photos in:', userUploadsPath);
    
    // ตรวจสอบว่าโฟลเดอร์มีอยู่หรือไม่
    if (!fs.existsSync(userUploadsPath)) {
      console.log('📂 User uploads folder not found:', userUploadsPath);
      return res.json({
        success: true,
        data: []
      });
    }
    
    // อ่านรายชื่อไฟล์ในโฟลเดอร์
    const files = fs.readdirSync(userUploadsPath);
    console.log('📁 Found files:', files);
    
    // ดึงข้อมูล user เพื่อเช็ค avatar
    const user = await User.findById(userId).select('avatar');
    
    // จัดเตรียมข้อมูลรูปภาพ
    const photos = files.map(filename => {
      const filePath = `/uploads/users/${userId}/${filename}`;
      const isProfile = user.avatar === filePath;
      
      return {
        id: filename.split('.')[0], // ใช้ชื่อไฟล์เป็น id
        path: filePath,
        filename,
        isProfile,
        uploadedAt: fs.statSync(path.join(userUploadsPath, filename)).mtime
      };
    });
    
    // เรียงตามเวลาอัพโหลดล่าสุด
    photos.sort((a, b) => b.uploadedAt - a.uploadedAt);
    
    console.log('📸 Sending photos response:', photos.length, 'photos');
    console.log('📸 First photo example:', photos[0]);
    
    res.json({
      success: true,
      data: photos
    });
  } catch (error) {
    console.error('Error getting photos:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลรูปภาพ',
      error: error.message
    });
  }
});

// @route   DELETE /api/profile/photos/:filename
// @desc    Delete a photo
// @access  Private
router.delete('/photos/:filename', protect, async (req, res) => {
  try {
    console.log('🗑️ Delete photo request received');
    const userId = req.user.id;
    const { filename } = req.params;
    console.log('🗑️ User ID:', userId);
    console.log('🗑️ Filename to delete:', filename);
    
    const filePath = path.join(__dirname, '..', 'uploads', 'users', userId, filename);
    console.log('🗑️ Full file path:', filePath);
    
    // ตรวจสอบว่าไฟล์มีอยู่หรือไม่
    if (!fs.existsSync(filePath)) {
      console.log('🗑️ File not found:', filePath);
      return res.status(404).json({
        success: false,
        message: 'ไม่พบไฟล์รูปภาพ'
      });
    }
    
    console.log('🗑️ File exists, proceeding to delete');
    
    // ตรวจสอบว่าเป็นรูปโปรไฟล์หลักหรือไม่
    const user = await User.findById(userId).select('avatar');
    const photoUrl = `/uploads/users/${userId}/${filename}`;
    
    if (user.avatar === photoUrl) {
      console.log('🗑️ This is profile photo, updating user avatar');
      // ถ้าเป็นรูปโปรไฟล์หลัก ให้เปลี่ยนเป็นรูปโปรไฟล์เริ่มต้น
      await User.findByIdAndUpdate(userId, { avatar: '/uploads/avatar/default.svg' });
    }
    
    // ลบไฟล์
    console.log('🗑️ Deleting file from filesystem');
    fs.unlinkSync(filePath);
    console.log('🗑️ File deleted successfully');
    
    res.json({
      success: true,
      message: 'ลบรูปภาพเรียบร้อยแล้ว'
    });
  } catch (error) {
    console.error('Error deleting photo:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการลบรูปภาพ',
      error: error.message
    });
  }
});

// @route   PUT /api/profile/set-profile-photo/:filename
// @desc    Set a photo as profile picture
// @access  Private
router.put('/set-profile-photo/:filename', protect, async (req, res) => {
  try {
    console.log('⭐ Set profile photo request received');
    const userId = req.user.id;
    const { filename } = req.params;
    console.log('⭐ User ID:', userId);
    console.log('⭐ Filename to set as profile:', filename);
    
    const filePath = path.join(__dirname, '..', 'uploads', 'users', userId, filename);
    console.log('⭐ Checking file path:', filePath);
    
    // ตรวจสอบว่าไฟล์มีอยู่หรือไม่
    if (!fs.existsSync(filePath)) {
      console.log('⭐ File not found:', filePath);
      return res.status(404).json({
        success: false,
        message: 'ไม่พบไฟล์รูปภาพ'
      });
    }
    
    console.log('⭐ File exists, updating user avatar');
    // อัพเดท avatar ใน user
    const photoUrl = `/uploads/users/${userId}/${filename}`;
    await User.findByIdAndUpdate(userId, { avatar: photoUrl });
    console.log('⭐ User avatar updated to:', photoUrl);
    
    res.json({
      success: true,
      message: 'ตั้งเป็นรูปโปรไฟล์เรียบร้อยแล้ว',
      data: {
        avatarUrl: photoUrl
      }
    });
  } catch (error) {
    console.error('Error setting profile photo:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการตั้งรูปโปรไฟล์',
      error: error.message
    });
  }
});

// @route   GET /api/profile/:username
// @desc    Get user profile by username
// @access  Public
router.get('/:username', async (req, res) => {
  try {
    const { username } = req.params;
    
    // ดึงข้อมูลผู้ใช้โดยไม่มีข้อมูลรหัสผ่าน
    const user = await User.findOne({ username }).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบผู้ใช้งาน'
      });
    }
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error getting user profile:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลโปรไฟล์',
      error: error.message
    });
  }
});

// @route   PUT /api/profile/privacy
// @desc    Update privacy settings
// @access  Private
router.put('/privacy', protect, async (req, res) => {
  try {
    console.log('🛡️ Privacy settings update request received');
    console.log('User ID:', req.user.id);
    console.log('New privacy settings:', req.body.privacySettings);
    
    const { privacySettings } = req.body;
    
    // อัปเดตข้อมูล privacy settings
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { privacySettings },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบข้อมูลผู้ใช้'
      });
    }
    
    console.log('🛡️ Privacy settings updated successfully');
    console.log('🛡️ New settings:', updatedUser.privacySettings);
    
    res.json({
      success: true,
      message: 'อัปเดตการตั้งค่าความเป็นส่วนตัวเรียบร้อยแล้ว',
      data: updatedUser
    });
    
  } catch (error) {
    console.error('Error updating privacy settings:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการอัปเดตการตั้งค่า',
      error: error.message
    });
  }
});

// ดึงรูปภาพของผู้ใช้
router.get('/photos', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('photos');
    res.json({
      success: true,
      photos: user.photos || []
    });
  } catch (error) {
    console.error('Error fetching photos:', error);
    res.status(500).json({ error: 'Failed to fetch photos' });
  }
});

// ลบรูปภาพ
router.delete('/photos/:photoId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const photoIndex = user.photos.findIndex(photo => photo._id.toString() === req.params.photoId);
    
    if (photoIndex === -1) {
      return res.status(404).json({ error: 'Photo not found' });
    }
    
    const photo = user.photos[photoIndex];
    
    // ลบไฟล์จาก server
    const filePath = path.join(__dirname, '..', photo.url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`🗑️ Deleted file: ${photo.filename}`);
    }
    
    // ลบข้อมูลจากฐานข้อมูล
    user.photos.splice(photoIndex, 1);
    await user.save();
    
    console.log(`🗑️ Deleted photo for user: ${req.user.username}`);
    res.json({ success: true, message: 'Photo deleted successfully' });
  } catch (error) {
    console.error('Error deleting photo:', error);
    res.status(500).json({ error: 'Failed to delete photo' });
  }
});

// ตั้งรูปภาพเป็นรูปโปรไฟล์
router.put('/photos/:photoId/set-profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const photoIndex = user.photos.findIndex(photo => photo._id.toString() === req.params.photoId);
    
    if (photoIndex === -1) {
      return res.status(404).json({ error: 'Photo not found' });
    }
    
    // รีเซ็ตรูปโปรไฟล์ทั้งหมด
    user.photos.forEach(photo => {
      photo.isProfilePhoto = false;
    });
    
    // ตั้งรูปที่เลือกเป็นรูปโปรไฟล์
    user.photos[photoIndex].isProfilePhoto = true;
    
    // อัปเดต avatar field ด้วย
    user.avatar = user.photos[photoIndex].url;
    
    await user.save();
    
    console.log(`👤 Set profile photo for user: ${req.user.username}`);
    res.json({ 
      success: true, 
      message: 'Profile photo updated successfully',
      avatar: user.avatar
    });
  } catch (error) {
    console.error('Error setting profile photo:', error);
    res.status(500).json({ error: 'Failed to set profile photo' });
  }
});

// จัดเรียงลำดับรูปภาพ
router.put('/photos/reorder', protect, async (req, res) => {
  try {
    const { photoIds } = req.body; // array ของ photo IDs ตามลำดับใหม่
    
    if (!Array.isArray(photoIds)) {
      return res.status(400).json({ error: 'Invalid photo order' });
    }
    
    const user = await User.findById(req.user.id);
    
    // อัปเดตลำดับของรูปภาพ
    photoIds.forEach((photoId, index) => {
      const photo = user.photos.find(p => p._id.toString() === photoId);
      if (photo) {
        photo.order = index;
      }
    });
    
    await user.save();
    
    console.log(`📸 Reordered photos for user: ${req.user.username}`);
    res.json({ success: true, message: 'Photos reordered successfully' });
  } catch (error) {
    console.error('Error reordering photos:', error);
    res.status(500).json({ error: 'Failed to reorder photos' });
  }
});

module.exports = router;
