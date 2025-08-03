const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// @route   GET /api/new-profile
// @desc    Get current user profile with ALL fields
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    console.log('📋 Getting complete profile for user:', req.user.id);
    
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบข้อมูลผู้ใช้'
      });
    }
    
    // สร้าง response object ที่ครบถ้วน
    const completeProfile = {
      // Basic Info
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      nickname: user.nickname || '',
      phone: user.phone || '',
      avatar: user.avatar || '/uploads/avatar/default.png',
      age: user.age || null,
      bio: user.bio || '',
      selfDescription: user.selfDescription || '',
      location: user.location || '',
      occupation: user.occupation || '',
      education: user.education || '',
      
      // Arrays
      interests: user.interests || [],
      lookingFor: user.lookingFor || [],
      
      // Personal Details Object
      personalDetails: {
        height: user.personalDetails?.height || null,
        weight: user.personalDetails?.weight || null,
        bodyType: user.personalDetails?.bodyType || '',
        exercise: user.personalDetails?.exercise || '',
        drinking: user.personalDetails?.drinking || '',
        smoking: user.personalDetails?.smoking || '',
        children: user.personalDetails?.children || '',
        languages: user.personalDetails?.languages || []
      },
      
      // Lifestyle Object
      lifeStyle: {
        pets: user.lifeStyle?.pets || '',
        diet: user.lifeStyle?.diet || '',
        religion: user.lifeStyle?.religion || '',
        zodiac: user.lifeStyle?.zodiac || '',
        mbti: user.lifeStyle?.mbti || '',
        workLifeBalance: user.lifeStyle?.workLifeBalance || ''
      },
      
      // Relationship Preferences Object
      relationshipPreferences: {
        relationshipType: user.relationshipPreferences?.relationshipType || '',
        location: user.relationshipPreferences?.location || '',
        ageRange: {
          min: user.relationshipPreferences?.ageRange?.min || null,
          max: user.relationshipPreferences?.ageRange?.max || null
        },
        dealBreakers: user.relationshipPreferences?.dealBreakers || []
      },
      
      // System fields
      verified: user.verified || false,
      status: user.status || 'active',
      createdAt: user.createdAt,
      lastLogin: user.lastLogin
    };
    
    console.log('✅ Complete profile returned with all fields');
    
    res.json({
      success: true,
      data: completeProfile
    });
  } catch (error) {
    console.error('❌ Error getting profile:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลโปรไฟล์',
      error: error.message
    });
  }
});

// @route   PUT /api/new-profile
// @desc    Update user profile with ALL fields support
// @access  Private
router.put('/', protect, async (req, res) => {
  try {
    console.log('🔄 Updating complete profile for user:', req.user.id);
    console.log('📝 Received data:', JSON.stringify(req.body, null, 2));
    
    const {
      // Basic fields
      firstName,
      lastName,
      nickname,
      phone,
      age,
      bio,
      selfDescription,
      location,
      occupation,
      education,
      
      // Array fields
      interests,
      lookingFor,
      
      // Object fields
      personalDetails,
      lifeStyle,
      relationshipPreferences
    } = req.body;
    
    // สร้าง update object
    const updateData = {};
    
    // Basic fields - อัปเดตเฉพาะที่ส่งมา
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (nickname !== undefined) updateData.nickname = nickname;
    if (phone !== undefined) updateData.phone = phone;
    if (age !== undefined) updateData.age = age;
    if (bio !== undefined) updateData.bio = bio;
    if (selfDescription !== undefined) updateData.selfDescription = selfDescription;
    if (location !== undefined) updateData.location = location;
    if (occupation !== undefined) updateData.occupation = occupation;
    if (education !== undefined) updateData.education = education;
    
    // Array fields
    if (interests !== undefined) updateData.interests = interests;
    if (lookingFor !== undefined) updateData.lookingFor = lookingFor;
    
    // Object fields - merge กับข้อมูลเดิม
    if (personalDetails !== undefined) {
      updateData.personalDetails = personalDetails;
    }
    
    if (lifeStyle !== undefined) {
      updateData.lifeStyle = lifeStyle;
    }
    
    if (relationshipPreferences !== undefined) {
      updateData.relationshipPreferences = relationshipPreferences;
    }
    
    console.log('💾 Final update data:', JSON.stringify(updateData, null, 2));
    
    // อัปเดตในฐานข้อมูล
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { 
        new: true, 
        runValidators: true,
        upsert: false
      }
    ).select('-password');
    
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบผู้ใช้'
      });
    }
    
    console.log('✅ Profile updated successfully');
    
    // ส่งข้อมูลที่อัปเดตกลับ (รูปแบบเดียวกับ GET)
    const completeProfile = {
      // Basic Info
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      role: updatedUser.role,
      firstName: updatedUser.firstName || '',
      lastName: updatedUser.lastName || '',
      nickname: updatedUser.nickname || '',
      phone: updatedUser.phone || '',
      avatar: updatedUser.avatar || '/uploads/avatar/default.png',
      age: updatedUser.age || null,
      bio: updatedUser.bio || '',
      selfDescription: updatedUser.selfDescription || '',
      location: updatedUser.location || '',
      occupation: updatedUser.occupation || '',
      education: updatedUser.education || '',
      
      // Arrays
      interests: updatedUser.interests || [],
      lookingFor: updatedUser.lookingFor || [],
      
      // Personal Details Object
      personalDetails: {
        height: updatedUser.personalDetails?.height || null,
        weight: updatedUser.personalDetails?.weight || null,
        bodyType: updatedUser.personalDetails?.bodyType || '',
        exercise: updatedUser.personalDetails?.exercise || '',
        drinking: updatedUser.personalDetails?.drinking || '',
        smoking: updatedUser.personalDetails?.smoking || '',
        children: updatedUser.personalDetails?.children || '',
        languages: updatedUser.personalDetails?.languages || []
      },
      
      // Lifestyle Object
      lifeStyle: {
        pets: updatedUser.lifeStyle?.pets || '',
        diet: updatedUser.lifeStyle?.diet || '',
        religion: updatedUser.lifeStyle?.religion || '',
        zodiac: updatedUser.lifeStyle?.zodiac || '',
        mbti: updatedUser.lifeStyle?.mbti || '',
        workLifeBalance: updatedUser.lifeStyle?.workLifeBalance || ''
      },
      
      // Relationship Preferences Object
      relationshipPreferences: {
        relationshipType: updatedUser.relationshipPreferences?.relationshipType || '',
        location: updatedUser.relationshipPreferences?.location || '',
        ageRange: {
          min: updatedUser.relationshipPreferences?.ageRange?.min || null,
          max: updatedUser.relationshipPreferences?.ageRange?.max || null
        },
        dealBreakers: updatedUser.relationshipPreferences?.dealBreakers || []
      },
      
      // System fields
      verified: updatedUser.verified || false,
      status: updatedUser.status || 'active',
      createdAt: updatedUser.createdAt,
      lastLogin: updatedUser.lastLogin
    };
    
    res.json({
      success: true,
      message: 'อัปเดตโปรไฟล์สำเร็จ',
      data: completeProfile
    });
    
  } catch (error) {
    console.error('❌ Error updating profile:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการอัปเดตโปรไฟล์',
      error: error.message
    });
  }
});

module.exports = router;
