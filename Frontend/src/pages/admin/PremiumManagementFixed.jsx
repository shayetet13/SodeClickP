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
  Plus
} from 'lucide-react';

const PremiumManagement = ({ onBack }) => {
  const [premiumUsers, setPremiumUsers] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedMembership, setSelectedMembership] = useState(null);
  const [showMembershipModal, setShowMembershipModal] = useState(false);
  const [customDays, setCustomDays] = useState('');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
    limit: 100
  });

  useEffect(() => {
    fetchPremiumUsers();
    fetchStats();
  }, [pagination.currentPage]);

  const fetchPremiumUsers = async (page = pagination.currentPage) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/memberships?page=${page}&limit=${pagination.limit}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPremiumUsers(data.data.memberships || []);
        setPagination(prev => ({
          ...prev,
          currentPage: data.data.pagination.current,
          totalPages: data.data.pagination.pages,
          total: data.data.pagination.total
        }));
      }
    } catch (error) {
      console.error('Error fetching premium users:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/memberships/stats', {
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

  const updateMembershipStatus = async (userId, role) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/memberships/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role })
      });
      
      if (response.ok) {
        fetchPremiumUsers();
        fetchStats();
      }
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  const extendMembership = async (userId, role) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/memberships/${userId}/extend`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role })
      });
      
      if (response.ok) {
        fetchPremiumUsers();
        fetchStats();
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

  const getPlanColor = (planType) => {
    switch (planType) {
      case 'silver': return 'text-gray-400 bg-gray-900/20';
      case 'gold': return 'text-amber-400 bg-amber-900/20';
      case 'vip': return 'text-purple-400 bg-purple-900/20';
      case 'vip1': return 'text-pink-400 bg-pink-900/20';
      case 'vip2': return 'text-indigo-400 bg-indigo-900/20';
      case 'diamond': return 'text-sky-400 bg-sky-900/20';
      case 'platinum': return 'text-cyan-400 bg-cyan-900/20';
      default: return 'text-zinc-400 bg-zinc-800/20';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-900/20';
      case 'expired': return 'text-red-400 bg-red-900/20';
      case 'cancelled': return 'text-yellow-400 bg-yellow-900/20';
      default: return 'text-zinc-400 bg-zinc-800/20';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack} className="gap-2">
            <ArrowLeft size={16} /> กลับ
          </Button>
          <h1 className="text-3xl font-serif font-bold text-amber-400">จัดการสมาชิก Premium</h1>
        </div>
      </div>

      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-b from-blue-950 to-black border-blue-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-400 text-sm font-medium">สมาชิก Premium ทั้งหมด</p>
                  <p className="text-2xl font-bold text-white">{stats.overview?.totalPremium || 0}</p>
                </div>
                <Crown className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-b from-green-950 to-black border-green-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-400 text-sm font-medium">รายได้รวม</p>
                  <p className="text-2xl font-bold text-white">฿{stats.revenue?.total?.toLocaleString() || 0}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-b from-purple-950 to-black border-purple-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-400 text-sm font-medium">รายได้เดือนนี้</p>
                  <p className="text-2xl font-bold text-white">฿{stats.revenue?.monthly?.toLocaleString() || 0}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-b from-amber-950 to-black border-amber-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-400 text-sm font-medium">ผู้ใช้ทั่วไป</p>
                  <p className="text-2xl font-bold text-white">{stats.overview?.totalRegular || 0}</p>
                </div>
                <Users className="h-8 w-8 text-amber-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {loading ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400 mx-auto mb-4"></div>
            <p className="text-zinc-400">กำลังโหลดข้อมูลสมาชิก Premium...</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-amber-400 flex items-center justify-between">
                <span>รายชื่อสมาชิก Premium</span>
                <span className="text-sm text-zinc-400 font-normal">
                  ({pagination.total} รายการ | หน้าละ 100 รายการ)
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {premiumUsers.map((membership) => (
                  <div key={membership._id} className="border border-zinc-800 rounded-lg p-4 hover:bg-zinc-800/30 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar className="w-12 h-12 border border-amber-500/30">
                          <AvatarImage 
                            src={membership.user?.avatar ? `http://localhost:5000${membership.user.avatar}` : '/uploads/avatar/default.png'} 
                            alt={membership.user?.username}
                          />
                          <AvatarFallback className="bg-amber-800 text-white">
                            {membership.user?.username?.charAt(0).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold text-white">{membership.user?.username}</h3>
                            <Crown size={16} className="text-amber-400" />
                          </div>
                          <p className="text-zinc-400 text-sm">{membership.user?.email}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPlanColor(membership.planType)}`}>
                              {membership.planName}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(membership.status)}`}>
                              {membership.status === 'active' ? 'ใช้งานอยู่' : 
                               membership.status === 'expired' ? 'หมดอายุ' : 'ยกเลิก'}
                            </span>
                            <span className="text-xs text-zinc-500">
                              ฿{membership.price} / {membership.duration} วัน
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right text-sm">
                          <p className="text-zinc-300">
                            หมดอายุ: {new Date(membership.endDate).toLocaleDateString('th-TH')}
                          </p>
                          <p className="text-zinc-500">
                            เหลือ: {Math.max(0, Math.ceil((new Date(membership.endDate) - new Date()) / (1000 * 60 * 60 * 24)))} วัน
                          </p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => {
                            setSelectedMembership(membership);
                            setShowMembershipModal(true);
                          }}
                          className="gap-2"
                        >
                          <Eye size={14} /> จัดการ
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {pagination.totalPages > 1 && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-zinc-400">
                    แสดง {premiumUsers.length} จาก {pagination.total} รายการ
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
                      {[...Array(Math.min(5, pagination.totalPages))].map((_, index) => {
                        const page = pagination.currentPage - 2 + index;
                        if (page < 1 || page > pagination.totalPages) return null;
                        
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
        </>
      )}

      {showMembershipModal && selectedMembership && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <Card className="max-w-lg w-full">
            <CardHeader className="border-b border-zinc-800">
              <div className="flex justify-between items-center">
                <CardTitle className="text-amber-400">จัดการสมาชิก</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setShowMembershipModal(false)}>
                  <XCircle size={20} />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-white">{selectedMembership.user?.username}</h3>
                  <p className="text-zinc-400">{selectedMembership.planName}</p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-zinc-300">
                    <strong>สถานะ:</strong> {selectedMembership.status === 'active' ? 'ใช้งานอยู่' : 'หมดอายุ'}
                  </p>
                  <p className="text-sm text-zinc-300">
                    <strong>วันที่หมดอายุ:</strong> {new Date(selectedMembership.endDate).toLocaleDateString('th-TH')}
                  </p>
                  <p className="text-sm text-zinc-300">
                    <strong>ราคา:</strong> ฿{selectedMembership.price}
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <h4 className="text-amber-400 font-semibold">การจัดการ</h4>
                  
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <Button 
                      variant="outline" 
                      className="gap-2"
                      onClick={() => {
                        updateMembershipStatus(selectedMembership._id, 'premium');
                      }}
                    >
                      <Plus size={14} /> เปลี่ยนเป็น Premium
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="gap-2"
                      onClick={() => {
                        updateMembershipStatus(selectedMembership._id, 'user');
                      }}
                    >
                      <XCircle size={14} /> เปลี่ยนเป็น User
                    </Button>
                  </div>
                  
                  <div className="flex gap-2 mb-4">
                    <select 
                      value={selectedMembership?.user?.role || 'user'}
                      onChange={(e) => {
                        updateMembershipStatus(selectedMembership._id, e.target.value);
                      }}
                      className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-600 rounded text-white">
                      <option value="user">User</option>
                      <option value="premium">Premium</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  {selectedMembership.user.role === 'premium' ? (
                    <Button 
                      variant="destructive" 
                      className="w-full gap-2"
                      onClick={() => {
                        updateMembershipStatus(selectedMembership._id, 'user');
                      }}
                    >
                      <XCircle size={14} /> ปลดสถานะ Premium
                    </Button>
                  ) : (
                    <Button 
                      variant="default" 
                      className="w-full gap-2"
                      onClick={() => {
                        updateMembershipStatus(selectedMembership._id, 'premium');
                      }}
                    >
                      <CheckCircle size={14} /> อัพเกรดเป็น Premium
                    </Button>
                  )}
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
