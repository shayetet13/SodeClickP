const Membership = require('../models/Membership');
const Payment = require('../models/Payment');
const User = require('../models/User');
const UserActivity = require('../models/UserActivity');

// @desc    Get all memberships (Admin)
// @route   GET /api/admin/memberships
// @access  Private/Admin
exports.getAllMemberships = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const skip = (page - 1) * limit;
    const search = req.query.search;

    console.log('Search parameters:', { page, limit, search });

    // สร้าง query สำหรับการค้นหา
    let query = { role: 'premium' };
    
    if (search && search.trim()) {
      const searchTerm = search.trim();
      console.log('Applying search filter for:', searchTerm);
      query.$or = [
        { username: { $regex: searchTerm, $options: 'i' } },
        { email: { $regex: searchTerm, $options: 'i' } },
        { firstName: { $regex: searchTerm, $options: 'i' } },
        { lastName: { $regex: searchTerm, $options: 'i' } }
      ];
    }

    console.log('Final query:', JSON.stringify(query, null, 2));

    // ดึงผู้ใช้ที่มี role เป็น premium
    const premiumUsers = await User.find(query)
      .select('username email firstName lastName avatar createdAt lastLogin')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    console.log(`Found ${premiumUsers.length} premium users`);

    const totalPremiumUsers = await User.countDocuments(query);

    // สร้างข้อมูล membership จาก premium users
    const memberships = premiumUsers.map(user => ({
      _id: user._id,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar
      },
      planType: 'premium',
      planName: 'Premium',
      status: 'active',
      startDate: user.createdAt,
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 วันจากวันนี้
      duration: 30,
      price: 299,
      isActive: true,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt
    }));

    console.log(`Returning ${memberships.length} memberships to frontend`);

    // Get statistics
    const totalUsers = await User.countDocuments();
    const totalPremium = await User.countDocuments({ role: 'premium' });
    const totalRegular = await User.countDocuments({ role: 'user' });
    const totalAdmin = await User.countDocuments({ role: 'admin' });

    res.json({
      success: true,
      data: {
        memberships,
        pagination: {
          current: page,
          pages: Math.ceil(totalPremiumUsers / limit),
          total: totalPremiumUsers
        },
        statistics: {
          totalUsers,
          totalPremium,
          totalRegular,
          totalAdmin,
          statusStats: [
            { _id: 'active', count: totalPremium },
            { _id: 'inactive', count: totalRegular }
          ],
          planStats: [
            { _id: 'premium', count: totalPremium, totalRevenue: totalPremium * 299 }
          ]
        }
      }
    });
  } catch (error) {
    console.error('Get all memberships error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลสมาชิก',
      error: error.message
    });
  }
};

// @desc    Get membership statistics (Admin)
// @route   GET /api/admin/memberships/stats
// @access  Private/Admin
exports.getMembershipStats = async (req, res) => {
  try {
    // ใช้ข้อมูลจาก User model แทน
    const totalUsers = await User.countDocuments();
    const totalPremium = await User.countDocuments({ role: 'premium' });
    const totalRegular = await User.countDocuments({ role: 'user' });
    const totalAdmin = await User.countDocuments({ role: 'admin' });
    
    // Revenue statistics (จำลองข้อมูล)
    const totalRevenue = totalPremium * 299; // คำนวณจากจำนวน premium users
    const monthlyRevenue = Math.floor(totalRevenue * 0.3); // สมมติว่า 30% เป็นรายได้เดือนนี้

    // Recent premium users
    const recentPremiumUsers = await User.find({ role: 'premium' })
      .select('username firstName lastName createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    // Growth statistics
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    const newPremiumThisMonth = await User.countDocuments({
      role: 'premium',
      createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
    });

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalPremium,
          totalRegular,
          totalAdmin,
          activeMemberships: totalPremium,
          expiredMemberships: 0
        },
        revenue: {
          total: totalRevenue,
          monthly: monthlyRevenue,
          growth: '+15%' // จำลองข้อมูล
        },
        planDistribution: [
          { _id: 'premium', count: totalPremium },
          { _id: 'regular', count: totalRegular }
        ],
        recentActivity: recentPremiumUsers.map(user => ({
          user: user.username || `${user.firstName} ${user.lastName}`,
          action: 'Upgraded to Premium',
          date: user.createdAt
        })),
        growth: {
          newPremiumThisMonth,
          percentageGrowth: newPremiumThisMonth > 0 ? '+' + Math.floor(Math.random() * 25) + '%' : '0%'
        }
      }
    });
  } catch (error) {
    console.error('Get membership statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลสถิติ',
      error: error.message
    });
  }
};

// @desc    Update membership status (Admin)
// @route   PUT /api/admin/memberships/:id/status
// @access  Private/Admin
exports.updateMembershipStatus = async (req, res) => {
  try {
    const { role } = req.body; // เปลี่ยนจาก status เป็น role
    const userId = req.params.id;

    // อัปเดต role ของ user
    const user = await User.findByIdAndUpdate(
      userId,
      { role: role },
      { new: true, select: 'username email firstName lastName role' }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบข้อมูลผู้ใช้'
      });
    }

    res.json({
      success: true,
      message: `อัปเดต role ผู้ใช้เป็น ${role} สำเร็จ`,
      data: user
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการอัปเดต role ผู้ใช้',
      error: error.message
    });
  }
};

// @desc    Extend membership (Admin)
// @route   PUT /api/admin/memberships/:id/extend
// @access  Private/Admin
exports.extendMembership = async (req, res) => {
  try {
    const { role } = req.body; // เปลี่ยนเป็นการอัปเดต role
    const userId = req.params.id;

    const user = await User.findByIdAndUpdate(
      userId,
      { role: role },
      { new: true, select: 'username email firstName lastName role' }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบข้อมูลผู้ใช้'
      });
    }

    res.json({
      success: true,
      message: `อัปเดต role ผู้ใช้เป็น ${role} สำเร็จ`,
      data: user
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการอัปเดต role ผู้ใช้',
      error: error.message
    });
  }
};
