const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const fs = require('fs');
const path = require('path');

// อัพโหลดรูป profile หลัก
router.post('/avatar/:userId', upload.single('avatar'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const userId = req.params.userId;
    const filePath = `/uploads/avatar/user_${userId}/${req.file.filename}`;
    
    res.json({
      message: 'Profile picture uploaded successfully',
      userId: userId,
      filename: req.file.filename,
      path: filePath,
      size: req.file.size
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// อัพโหลดรูปเพิ่มเติม (หลายรูปพร้อมกัน)
router.post('/photos/:userId', upload.array('photos', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const userId = req.params.userId;
    const uploadedFiles = req.files.map(file => ({
      filename: file.filename,
      path: `/uploads/avatar/user_${userId}/${file.filename}`,
      size: file.size
    }));
    
    res.json({
      message: 'Photos uploaded successfully',
      userId: userId,
      files: uploadedFiles,
      count: uploadedFiles.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ดูรูปภาพทั้งหมดของ user
router.get('/photos/:userId', (req, res) => {
  try {
    const userId = req.params.userId;
    const userDir = path.join(__dirname, '..', 'uploads', 'avatar', `user_${userId}`);
    
    if (!fs.existsSync(userDir)) {
      return res.json({ photos: [] });
    }
    
    const files = fs.readdirSync(userDir);
    const photos = files.map(file => ({
      filename: file,
      path: `/uploads/avatar/user_${userId}/${file}`,
      isProfile: file.startsWith('profile.')
    }));
    
    res.json({
      userId: userId,
      photos: photos,
      count: photos.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ลบรูปภาพ
router.delete('/photo/:userId/:filename', (req, res) => {
  try {
    const { userId, filename } = req.params;
    const filePath = path.join(__dirname, '..', 'uploads', 'avatar', `user_${userId}`, filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    fs.unlinkSync(filePath);
    
    res.json({
      message: 'Photo deleted successfully',
      userId: userId,
      filename: filename
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
