import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '../../components/ui/avatar';
import { 
  Crown, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Users, 
  ArrowLeft,
  Eye,
  Gift,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  Search,
  Star,
  Award,
  Gem,
  Trophy,
  Shield,
  Medal,
  Hexagon,
  CircleDot
} from 'lucide-react';
import { useConfirmDialog } from '../../components/ui/confirm-dialog';
import { API_BASE_URL } from '../../utils/constants';

// กำหนดลำดับบทบาท VIP ตามที่ต้องการ
const roleOrder = ['Platinum', 'Diamond', 'VIP2', 'VIP1', 'VIP', 'Gold', 'Silver'];

const PremiumManagement = ({ onBack }) => {
  const [vipUsers, setVipUsers] = useState([]);
  const [stats, setStats] = useState({});
  const [membershipDetails, setMembershipDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
    limit: 50
  });

  // VIP Role definitions with colors, icons, and features
  const roleConfig = {
    'Platinum': { 
      icon: Shield, 
      color: 'text-indigo-400 bg-indigo-900/20', 
      borderColor: 'border-indigo-500/30',
      name: 'Platinum',
      priority: 7,
      price: 1000,
      features: {
        dailyChats: 'ไม่จำกัด',
        maxPhotos: 'ไม่จำกัด',
        maxVideos: 'ไม่จำกัด',
        dailyBonus: '100,000 เหรียญ',
        spinWheel: 'ทุก 10 นาที',
        transferCoins: true
      }
    },
    'Diamond': { 
      icon: Gem, 
      color: 'text-cyan-400 bg-cyan-900/20', 
      borderColor: 'border-cyan-500/30',
      name: 'Diamond',
      priority: 6,
      price: 500,
      features: {
        dailyChats: '500 คน',
        maxPhotos: 'ไม่จำกัด',
        maxVideos: 'ไม่จำกัด',
        dailyBonus: '50,000 เหรียญ',
        spinWheel: 'ทุก 20 นาที',
        transferCoins: true
      }
    },
    'VIP2': { 
      icon: Trophy, 
      color: 'text-yellow-400 bg-yellow-900/20', 
      borderColor: 'border-yellow-500/30',
      name: 'VIP 2',
      priority: 5,
      price: 300,
      features: {
        dailyChats: '300 คน',
        maxPhotos: 'ไม่จำกัด',
        maxVideos: 'ไม่จำกัด',
        dailyBonus: '30,000 เหรียญ',
        spinWheel: 'ทุก 30 นาที',
        transferCoins: false
      }
    },
    'VIP1': { 
      icon: Medal, 
      color: 'text-pink-400 bg-pink-900/20', 
      borderColor: 'border-pink-500/30',
      name: 'VIP 1',
      priority: 4,
      price: 150,
      features: {
        dailyChats: '180 คน',
        maxPhotos: '150 รูป',
        maxVideos: '75 คลิป',
        dailyBonus: '15,000 เหรียญ',
        spinWheel: 'ทุก 45 นาที',
        transferCoins: false
      }
    },
    'VIP': { 
      icon: CircleDot, 
      color: 'text-purple-400 bg-purple-900/20', 
      borderColor: 'border-purple-500/30',
      name: 'VIP',
      priority: 3,
      price: 100,
      features: {
        dailyChats: '120 คน',
        maxPhotos: '100 รูป',
        maxVideos: '50 คลิป',
        dailyBonus: '8,000 เหรียญ',
        spinWheel: 'ทุก 1 ชั่วโมง',
        transferCoins: false
      }
    },
    'Gold': { 
      icon: Star, 
      color: 'text-amber-400 bg-amber-900/20', 
      borderColor: 'border-amber-500/30',
      name: 'Gold',
      priority: 2,
      price: 50,
      features: {
        dailyChats: '60 คน',
        maxPhotos: '50 รูป',
        maxVideos: '25 คลิป',
        dailyBonus: '3,000 เหรียญ',
        spinWheel: 'ทุก 90 นาที',
        transferCoins: false
      }
    },
    'Silver': { 
      icon: Award, 
      color: 'text-slate-400 bg-slate-900/20', 
      borderColor: 'border-slate-500/30',
      name: 'Silver',
      priority: 1,
      price: 20,
      features: {
        dailyChats: '30 คน',
        maxPhotos: '30 รูป',
        maxVideos: '10 คลิป',
        dailyBonus: '1,000 เหรียญ',
        spinWheel: 'ทุก 2 ชั่วโมง',
        transferCoins: false
      }
    }
  };

  const confirmDialog = useConfirmDialog();

  useEffect(() => {
    fetchVipUsers();
    fetchStats();
    fetchMembershipDetails();
  }, [pagination.currentPage, selectedRole]);

  // Separate useEffect for search with debouncing
  useEffect(() => {
    if (searchTerm === '') {
      setPagination(prev => ({ ...prev, currentPage: 1 }));
      fetchVipUsers(1, '');
      return;
    }

    const timeoutId = setTimeout(() => {
      console.log('Search triggered for:', searchTerm);
      setPagination(prev => ({ ...prev, currentPage: 1 }));
      fetchVipUsers(1, searchTerm);
    }, 800);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const fetchVipUsers = async (page = pagination.currentPage, searchQuery = searchTerm) => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', pagination.limit.toString());
      
      if (searchQuery && searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }

      if (selectedRole && selectedRole !== 'all') {
        params.append('role', selectedRole);
      }

      const queryString = params.toString();
      const response = await fetch(`${API_BASE_URL}/api/admin/users/vip?${queryString}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setVipUsers(data.data.users || []);
        setPagination(prev => ({
          ...prev,
          currentPage: data.data.pagination.current,
          totalPages: data.data.pagination.pages,
          total: data.data.pagination.total
        }));
      }
    } catch (error) {
      console.error('Error fetching VIP users:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/admin/users/vip/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMembershipDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/admin/memberships`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Create a map of user ID to membership details
        const membershipMap = {};
        if (data.data && data.data.memberships) {
          data.data.memberships.forEach(membership => {
            if (membership.user && membership.user._id) {
              membershipMap[membership.user._id] = membership;
            }
          });
        }
        setMembershipDetails(membershipMap);
      }
    } catch (error) {
      console.error('Error fetching membership details:', error);
    }
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: newRole })
      });
      
      if (response.ok) {
        fetchVipUsers();
        fetchStats();
        fetchMembershipDetails();
        setShowRoleModal(false);
        setSelectedUser(null);
      }
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({
      ...prev,
      currentPage: newPage
    }));
    // เลื่อนขึ้นไปบนสุดของหน้า
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrevPage = () => {
    if (pagination.currentPage > 1) {
      handlePageChange(pagination.currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (pagination.currentPage < pagination.totalPages) {
      handlePageChange(pagination.currentPage + 1);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Manual search triggered for:', searchTerm);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    fetchVipUsers(1, searchTerm);
  };

  const handleResetSearch = () => {
    console.log('Resetting search');
    setSearchTerm('');
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    fetchVipUsers(1, '');
  };

  const handleRoleFilter = (role) => {
    setSelectedRole(role);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const getRoleIcon = (role) => {
    const config = roleConfig[role];
    if (!config) return Crown;
    return config.icon;
  };

  const getRoleColor = (role) => {
    const config = roleConfig[role];
    if (!config) return 'text-gray-600 bg-gray-100';
    return config.color;
  };

  const getRoleName = (role) => {
    const config = roleConfig[role];
    if (!config) return role;
    return config.name;
  };
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack} className="gap-2">
            <ArrowLeft size={16} /> กลับ
          </Button>
          <h1 className="text-3xl font-serif font-bold text-amber-400">จัดการสมาชิก VIP</h1>
        </div>
        <Card>
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400 mx-auto mb-4"></div>
            <p className="text-zinc-400">กำลังโหลดข้อมูลสมาชิก VIP...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack} className="gap-2">
            <ArrowLeft size={16} /> กลับ
          </Button>
          <h1 className="text-3xl font-serif font-bold text-amber-400">จัดการสมาชิก VIP</h1>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(roleConfig)
          .sort(([,a], [,b]) => b.priority - a.priority) // Sort by priority (highest first)
          .map(([role, config]) => {
            const IconComponent = config.icon;
            const count = stats[role] || 0;
            return (
              <Card key={role} className={`${config.borderColor} border bg-gradient-to-br from-zinc-900 to-black`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-zinc-400">{config.name}</p>
                      <p className="text-2xl font-bold text-white">{count}</p>
                      <p className="text-xs text-zinc-500 mt-1">฿{config.price}/เดือน</p>
                    </div>
                    <div className="text-center">
                      <IconComponent className={`h-8 w-8 ${config.color.split(' ')[0]} mb-1`} />
                      <div className="text-xs text-zinc-500">
                        {config.features.dailyChats}
                      </div>
                    </div>
                  </div>
                  {count > 0 && (
                    <div className="mt-2 pt-2 border-t border-zinc-800">
                      <div className="text-xs text-zinc-400 space-y-1">
                        <div>💰 รายได้: ฿{(count * config.price).toLocaleString()}</div>
                        <div>📊 สัดส่วน: {stats.total > 0 ? Math.round((count / stats.total) * 100) : 0}%</div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
      </div>

      {/* Filters and Search */}
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button 
            variant={selectedRole === 'all' ? 'default' : 'outline'}
            onClick={() => handleRoleFilter('all')}
            className="gap-2"
          >
            <Users size={16} /> ทั้งหมด
          </Button>
          {Object.entries(roleConfig)
            .sort(([,a], [,b]) => b.priority - a.priority) // Sort by priority (highest first)
            .map(([role, config]) => {
              const IconComponent = config.icon;
              return (
                <Button 
                  key={role}
                  variant={selectedRole === role ? 'default' : 'outline'}
                  onClick={() => handleRoleFilter(role)}
                  className="gap-2"
                >
                  <IconComponent size={16} /> {config.name}
                </Button>
              );
            })}
        </div>

        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" size={16} />
            <input
              type="text"
              placeholder="ค้นหาด้วยชื่อ, อีเมล, หรือ Member ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <Button type="submit" variant="outline">ค้นหา</Button>
          <Button 
            type="button"
            onClick={handleResetSearch} 
            variant="ghost"
          >
            ล้าง
          </Button>
        </form>
      </div>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-amber-400 flex items-center justify-between">
            <span>รายชื่อสมาชิก VIP</span>
            <span className="text-sm text-zinc-400 font-normal">
              ({pagination.total} รายการ)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {vipUsers
              .sort((a, b) => {
                // เทียบ role แบบ trim และตรง case
                const roleA = a.role ? a.role.trim() : '';
                const roleB = b.role ? b.role.trim() : '';
                const idxA = roleOrder.indexOf(roleA);
                const idxB = roleOrder.indexOf(roleB);
                if (idxA === -1 && idxB === -1) return 0;
                if (idxA === -1) return 1;
                if (idxB === -1) return -1;
                return idxA - idxB;
              })
              .map((user) => {
              const IconComponent = getRoleIcon(user.role);
              return (
                <div key={user._id} className="border border-zinc-800 rounded-lg p-4 hover:bg-zinc-800/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-12 h-12 border border-amber-500/30">
                        <AvatarImage 
                          src={user.avatar ? `${API_BASE_URL}${user.avatar}` : '/uploads/avatar/default.png'} 
                          alt={user.username}
                        />
                        <AvatarFallback className="bg-amber-800 text-white">
                          {user.username?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold text-white">{user.username}</h3>
                          <IconComponent size={16} className={getRoleColor(user.role).split(' ')[0]} />
                        </div>
                        <p className="text-zinc-400 text-sm">{user.email}</p>
                        <div className="flex flex-col gap-2 mt-1">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                              {getRoleName(user.role)}
                            </span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              user.status === 'active' ? 'bg-green-900/30 text-green-400' : 
                              user.status === 'banned' ? 'bg-red-900/30 text-red-400' : 
                              'bg-gray-900/30 text-gray-400'
                            }`}>
                              {user.status === 'active' ? 'ใช้งานอยู่' : 
                               user.status === 'banned' ? 'ถูกแบน' : 
                               user.status || 'ไม่ทราบสถานะ'}
                            </span>
                            {user.memberId && (
                              <span className="text-xs text-zinc-500">
                                🆔 {user.memberId}
                              </span>
                            )}
                          </div>
                          
                          {/* Membership Benefits */}
                          {roleConfig[user.role] && (
                            <div className="text-xs text-zinc-400 space-y-1">
                              <div className="flex items-center gap-4">
                                <span>💬 แชท: {roleConfig[user.role].features.dailyChats}</span>
                                <span>📸 รูป: {roleConfig[user.role].features.maxPhotos}</span>
                                <span>🎬 วิดีโอ: {roleConfig[user.role].features.maxVideos}</span>
                              </div>
                              <div className="flex items-center gap-4">
                                <span>💰 โบนัส: {roleConfig[user.role].features.dailyBonus}</span>
                                <span>🎰 วงล้อ: {roleConfig[user.role].features.spinWheel}</span>
                                {roleConfig[user.role].features.transferCoins && (
                                  <span className="text-amber-400">💸 โอนเหรียญได้</span>
                                )}
                              </div>
                              <div className="text-zinc-500">
                                <span>ราคา: ฿{roleConfig[user.role].price} | </span>
                                <span>ลงทะเบียน: {new Date(user.createdAt).toLocaleDateString('th-TH')}</span>
                                {user.lastLogin && (
                                  <span> | เข้าใช้ล่าสุด: {new Date(user.lastLogin).toLocaleDateString('th-TH')}</span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => {
                          setSelectedUser(user);
                          setShowRoleModal(true);
                        }}
                        className="gap-2"
                      >
                        <Eye size={14} /> จัดการ
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-zinc-400">
                แสดง {vipUsers.length} จาก {pagination.total} รายการ
                (หน้า {pagination.currentPage} จาก {pagination.totalPages})
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handlePrevPage}
                  disabled={pagination.currentPage <= 1}
                  className="gap-2"
                >
                  ← หน้าก่อน
                </Button>
                
                <div className="flex items-center gap-1">
                  {[...Array(pagination.totalPages)].map((_, index) => {
                    const page = index + 1;
                    
                    return (
                      <Button
                        key={page}
                        variant={page === pagination.currentPage ? "default" : "ghost"}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                        className="min-w-[40px]"
                      >
                        {page}
                      </Button>
                    );
                  })}
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleNextPage}
                  disabled={pagination.currentPage >= pagination.totalPages}
                  className="gap-2"
                >
                  หน้าถัดไป →
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Role Management Modal */}
      {showRoleModal && selectedUser && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <Card className="max-w-lg w-full">
            <CardHeader className="border-b border-zinc-800">
              <div className="flex justify-between items-center">
                <CardTitle className="text-amber-400">จัดการบทบาท</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setShowRoleModal(false)}>
                  <XCircle size={20} />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-white">{selectedUser.username}</h3>
                  <p className="text-zinc-400">{selectedUser.email}</p>
                  <p className="text-sm text-zinc-500">Member ID: {selectedUser.memberId}</p>
                </div>

                <div className="space-y-3">
                  <div className="bg-zinc-800/50 rounded-lg p-3">
                    <p className="text-sm text-zinc-300 mb-2">
                      <strong>บทบาทปัจจุบัน:</strong> {getRoleName(selectedUser.role)}
                    </p>
                    <p className="text-sm text-zinc-300 mb-2">
                      <strong>สถานะ:</strong> 
                      <span className={`ml-2 px-2 py-1 rounded text-xs ${
                        selectedUser.status === 'active' ? 'bg-green-900/30 text-green-400' : 
                        selectedUser.status === 'banned' ? 'bg-red-900/30 text-red-400' : 
                        'bg-gray-900/30 text-gray-400'
                      }`}>
                        {selectedUser.status === 'active' ? 'ใช้งานอยู่' : 
                         selectedUser.status === 'banned' ? 'ถูกแบน' : 
                         selectedUser.status || 'ไม่ทราบสถานะ'}
                      </span>
                    </p>
                    <p className="text-sm text-zinc-300">
                      <strong>วันที่ลงทะเบียน:</strong> {new Date(selectedUser.createdAt).toLocaleDateString('th-TH')}
                    </p>
                    {selectedUser.lastLogin && (
                      <p className="text-sm text-zinc-300">
                        <strong>เข้าใช้ล่าสุด:</strong> {new Date(selectedUser.lastLogin).toLocaleDateString('th-TH')}
                      </p>
                    )}
                  </div>
                  
                  {/* Current Membership Benefits */}
                  {roleConfig[selectedUser.role] && (
                    <div className="bg-zinc-800/30 rounded-lg p-3">
                      <h5 className="text-amber-400 font-medium mb-2">สิทธิประโยชน์ปัจจุบัน</h5>
                      <div className="text-xs text-zinc-400 space-y-1">
                        <div>💬 แชทรายวัน: {roleConfig[selectedUser.role].features.dailyChats}</div>
                        <div>📸 อัพรูปภาพ: {roleConfig[selectedUser.role].features.maxPhotos}</div>
                        <div>🎬 อัพวิดีโอ: {roleConfig[selectedUser.role].features.maxVideos}</div>
                        <div>💰 โบนัสรายวัน: {roleConfig[selectedUser.role].features.dailyBonus}</div>
                        <div>🎰 หมุนวงล้อ: {roleConfig[selectedUser.role].features.spinWheel}</div>
                        {roleConfig[selectedUser.role].features.transferCoins && (
                          <div className="text-amber-400">💸 สามารถโอนเหรียญได้</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <h4 className="text-amber-400 font-semibold">เปลี่ยนบทบาท</h4>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(roleConfig)
                      .sort(([,a], [,b]) => b.priority - a.priority) // Sort by priority (highest first)
                      .map(([role, config]) => {
                        const IconComponent = config.icon;
                        return (
                          <div key={role} className="space-y-1">
                            <Button 
                              variant={selectedUser.role === role ? "default" : "outline"}
                              className="gap-2 justify-start w-full"
                              onClick={async () => {
                                const confirmed = await confirmDialog.confirm({
                                  title: 'ยืนยันการเปลี่ยนบทบาท',
                                  message: `คุณต้องการเปลี่ยนบทบาทของผู้ใช้นี้เป็น ${config.name} หรือไม่?\n\nสิทธิประโยชน์ใหม่:\n• แชท: ${config.features.dailyChats}\n• รูปภาพ: ${config.features.maxPhotos}\n• วิดีโอ: ${config.features.maxVideos}\n• โบนัส: ${config.features.dailyBonus}\n• ราคา: ฿${config.price}`,
                                  confirmText: 'ยืนยัน',
                                  cancelText: 'ยกเลิก',
                                  confirmVariant: 'default',
                                });
                                if (confirmed) {
                                  updateUserRole(selectedUser._id, role);
                                }
                              }}
                            >
                              <IconComponent size={14} /> {config.name}
                            </Button>
                            <div className="text-xs text-zinc-500 px-2">
                              ฿{config.price} | {config.features.dailyChats}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                  
                  <Button 
                    variant="outline"
                    className="w-full gap-2"
                    onClick={async () => {
                      const confirmed = await confirmDialog.confirm({
                        title: 'ยืนยันการเปลี่ยนบทบาท',
                        message: 'คุณต้องการเปลี่ยนบทบาทของผู้ใช้นี้เป็น User ทั่วไป หรือไม่?',
                        confirmText: 'ยืนยัน',
                        cancelText: 'ยกเลิก',
                        confirmVariant: 'default',
                      });
                      if (confirmed) {
                        updateUserRole(selectedUser._id, 'user');
                      }
                    }}
                  >
                    <Users size={14} /> เปลี่ยนเป็น User ทั่วไป
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default PremiumManagement;
