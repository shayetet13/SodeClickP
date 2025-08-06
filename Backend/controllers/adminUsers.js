const User = require('../models/User');

// @desc    Get all users with pagination and filtering
// @route   GET /api/admin/users
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', status = '', role = '' } = req.query;
    
    console.log('=== Admin Users Request ===');
    console.log('Query params:', { page, limit, search, status, role });
    console.log('Original URL:', req.originalUrl);
    
    // Check if this is a VIP users request
    const isVipRequest = req.originalUrl.includes('/vip');
    
    // สร้าง filter object
    const filter = {};
    
    if (isVipRequest) {
      // For VIP endpoint, only show VIP-tier users
      filter.role = { 
        $in: ['Platinum', 'Diamond', 'VIP2', 'VIP1', 'VIP', 'Gold', 'Silver'] 
      };
      
      // If specific role is requested, filter by that role
      if (role && role !== 'all' && ['Platinum', 'Diamond', 'VIP2', 'VIP1', 'VIP', 'Gold', 'Silver'].includes(role)) {
        filter.role = role;
      }
    } else {
      // กรองตามบทบาท (for regular endpoint)
      if (role && role !== 'all') {
        filter.role = role;
      }
    }
    
    // กรองตามคำค้นหา
    if (search && search.trim()) {
      filter.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { memberId: { $regex: search, $options: 'i' } }
      ];
    }
    
    // กรองตามสถานะ
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    console.log('Final filter:', filter);
    
    // คำนวณ pagination
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;
    
    // ดึงข้อมูลผู้ใช้
    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber)
      .lean();
    
    // นับจำนวนผู้ใช้ทั้งหมดที่ตรงกับ filter
    const totalUsers = await User.countDocuments(filter);
    const totalPages = Math.ceil(totalUsers / limitNumber);
    
    console.log('Query results:', {
      usersFound: users.length,
      totalUsers,
      totalPages,
      currentPage: pageNumber,
      isVipRequest
    });
    
    res.json({
      success: true,
      data: {
        users,
        pagination: {
          current: pageNumber,
          pages: totalPages,
          total: totalUsers,
          limit: limitNumber,
          hasNextPage: pageNumber < totalPages,
          hasPrevPage: pageNumber > 1
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Error in getAllUsers:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้',
      error: error.message,
      data: {
        users: [],
        pagination: {
          current: 1,
          pages: 0,
          total: 0,
          limit: 20
        }
      }
    });
  }
};

// @desc    Get user details by ID
// @route   GET /api/admin/users/:id
exports.getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบผู้ใช้ที่ระบุ'
      });
    }
    
    res.json({
      success: true,
      data: user
    });
    
  } catch (error) {
    console.error('Error getting user details:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้',
      error: error.message
    });
  }
};

// @desc    Ban user
// @route   PUT /api/admin/users/:id/ban
exports.banUser = async (req, res) => {
  try {
    const { reason = 'Violation of terms' } = req.body;
    
    console.log('🚫 Ban user request received');
    console.log('🚫 User ID to ban:', req.params.id);
    console.log('🚫 Ban reason:', reason);
    console.log('🚫 Admin user:', req.user.username);
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      console.log('🚫 User not found:', req.params.id);
      return res.status(404).json({
        success: false,
        message: 'ไม่พบผู้ใช้ที่ระบุ'
      });
    }
    
    // ป้องกันการแบน Admin
    if (user.role === 'admin') {
      console.log('🚫 Attempted to ban admin user:', user.username);
      return res.status(403).json({
        success: false,
        message: 'ไม่สามารถแบนผู้ดูแลระบบได้'
      });
    }
    
    // อัพเดตสถานะโดยไม่เปลี่ยน role
    const updateData = {
      status: 'banned',
      banReason: reason,
      bannedAt: new Date()
    };
    
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { 
        new: true, 
        runValidators: false // ปิด validation เพื่อหลีกเลี่ยงปัญหา enum
      }
    );
    
    console.log('🚫 User banned successfully:', {
      userId: updatedUser._id,
      username: updatedUser.username,
      status: updatedUser.status,
      reason: reason
    });
    
    res.json({
      success: true,
      message: 'แบนผู้ใช้เรียบร้อยแล้ว',
      data: {
        userId: updatedUser._id,
        username: updatedUser.username,
        status: updatedUser.status,
        banReason: updatedUser.banReason,
        bannedAt: updatedUser.bannedAt
      }
    });
    
  } catch (error) {
    console.error('🚫 Error banning user:', error);
    console.error('🚫 Error stack:', error.stack);
    
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการแบนผู้ใช้',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// @desc    Unban user
// @route   PUT /api/admin/users/:id/unban
exports.unbanUser = async (req, res) => {
  try {
    console.log('✅ Unban user request received');
    console.log('✅ User ID to unban:', req.params.id);
    console.log('✅ Admin user:', req.user.username);
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      console.log('✅ User not found:', req.params.id);
      return res.status(404).json({
        success: false,
        message: 'ไม่พบผู้ใช้ที่ระบุ'
      });
    }

    console.log('✅ Current user data:', {
      id: user._id,
      username: user.username,
      status: user.status,
      role: user.role,
      banReason: user.banReason,
      bannedAt: user.bannedAt
    });

    // อัพเดตสถานะโดยใช้ findByIdAndUpdate เพื่อหลีกเลี่ยงปัญหา validation
    const updateData = {
      status: 'active',
      $unset: {
        banReason: 1,
        bannedAt: 1
      }
    };
    
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { 
        new: true, 
        runValidators: false, // ปิด validation เพื่อหลีกเลี่ยงปัญหา enum
        select: '-password'
      }
    );
    
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'ไม่สามารถอัพเดตข้อมูลผู้ใช้ได้'
      });
    }
    
    console.log('✅ User unbanned successfully:', {
      userId: updatedUser._id,
      username: updatedUser.username,
      newStatus: updatedUser.status,
      role: updatedUser.role
    });

    res.json({
      success: true,
      message: 'ยกเลิกการแบนผู้ใช้เรียบร้อยแล้ว',
      data: {
        userId: updatedUser._id,
        username: updatedUser.username,
        status: updatedUser.status,
        role: updatedUser.role
      }
    });
    
  } catch (error) {
    console.error('Error unbanning user:', error);
    console.error('Error stack:', error.stack);
    
    // ตรวจสอบว่าเป็น validation error หรือไม่
    if (error.name === 'ValidationError') {
      console.error('Validation error details:', error.errors);
      
      // ลองใช้ตัวเลือกการอัพเดตที่เข้มงวดน้อยกว่า
      try {
        console.log('Attempting direct MongoDB update...');
        const result = await User.collection.updateOne(
          { _id: new mongoose.Types.ObjectId(req.params.id) },
          { 
            $set: { status: 'active' },
            $unset: { banReason: "", bannedAt: "" }
          }
        );
        
        if (result.modifiedCount > 0) {
          const updatedUser = await User.findById(req.params.id).select('-password');
          console.log('Direct update successful:', updatedUser);
          
          return res.json({
            success: true,
            message: 'ยกเลิกการแบนผู้ใช้เรียบร้อยแล้ว',
            data: {
              userId: updatedUser._id,
              username: updatedUser.username,
              status: updatedUser.status
            }
          });
        }
      } catch (directUpdateError) {
        console.error('Direct update also failed:', directUpdateError);
      }
    }
    
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการยกเลิกการแบน',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? {
        errorName: error.name,
        errorStack: error.stack,
        validationErrors: error.errors
      } : undefined
    });
  }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!['user', 'premium', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'บทบาทไม่ถูกต้อง (ต้องเป็น user, premium, หรือ admin)'
      });
    }
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบผู้ใช้ที่ระบุ'
      });
    }
    
    // ป้องกันการเปลี่ยนบทบาทของตัวเอง
    if (user._id.toString() === req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'ไม่สามารถเปลี่ยนบทบาทของตัวเองได้'
      });
    }
    
    // อัพเดตบทบาทโดยใช้ findByIdAndUpdate
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { role: role } },
      { 
        new: true, 
        runValidators: true,
        select: '-password'
      }
    );
    
    console.log('User role updated successfully:', {
      userId: updatedUser._id,
      username: updatedUser.username,
      newRole: updatedUser.role
    });
    
    res.json({
      success: true,
      message: 'อัปเดตบทบาทผู้ใช้เรียบร้อยแล้ว',
      data: {
        userId: updatedUser._id,
        username: updatedUser.username,
        role: updatedUser.role
      }
    });
    
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการอัปเดตบทบาท',
      error: error.message
    });
  }
};

// @desc    Get user statistics
// @route   GET /api/admin/users/stats
exports.getUserStats = async (req, res) => {
  try {
    console.log('=== Fetching User Stats ===');
    
    // Check if this is a VIP stats request
    const isVipStats = req.originalUrl.includes('/vip/stats');
    
    if (isVipStats) {
      // VIP-specific stats
      const PlatinumCount = await User.countDocuments({ role: 'Platinum' });
      const DiamondCount = await User.countDocuments({ role: 'Diamond' });
      const VIP2Count = await User.countDocuments({ role: 'VIP2' });
      const VIP1Count = await User.countDocuments({ role: 'VIP1' });
      const VIPCount = await User.countDocuments({ role: 'VIP' });
      const GoldCount = await User.countDocuments({ role: 'Gold' });
      const SilverCount = await User.countDocuments({ role: 'Silver' });
      
      const stats = {
        Platinum: PlatinumCount,
        Diamond: DiamondCount,
        VIP2: VIP2Count,
        VIP1: VIP1Count,
        VIP: VIPCount,
        Gold: GoldCount,
        Silver: SilverCount,
        total: PlatinumCount + DiamondCount + VIP2Count + VIP1Count + VIPCount + GoldCount + SilverCount
      };
      
      console.log('VIP stats:', stats);
      
      return res.status(200).json({
        success: true,
        data: stats
      });
    }
    
    // Regular user stats
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ status: 'active' });
    const premiumUsers = await User.countDocuments({ role: 'premium' });
    const bannedUsers = await User.countDocuments({ status: 'banned' });
    
    const stats = {
      total: totalUsers,
      active: activeUsers,
      premium: premiumUsers,
      banned: bannedUsers
    };
    
    console.log('User stats:', stats);
    
    res.status(200).json({
      success: true,
      data: stats
    });
    
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงสถิติผู้ใช้',
      error: error.message
    });
  }
};

