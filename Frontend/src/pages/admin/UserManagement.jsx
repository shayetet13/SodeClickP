import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '../../components/ui/avatar';
import { 
  Users, 
  Search, 
  Filter, 
  MoreVertical, 
  Eye, 
  Ban, 
  UserCheck,
  Calendar,
  Crown,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ArrowLeft
} from 'lucide-react';

const UserManagement = ({ onBack, filter = 'all' }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(filter);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
    limit: 20
  });
  // เพิ่ม state สำหรับเก็บสถิติรวมทั้งหมด
  const [totalStats, setTotalStats] = useState({
    total: 0,
    active: 0,
    premium: 0,
    banned: 0
  });

  useEffect(() => {
    fetchUsers();
    fetchTotalStats(); // ดึงสถิติรวมแยกต่างหาก
  }, [statusFilter, pagination.currentPage]);

  useEffect(() => {
    if (!searchTerm) {
      return;
    }

    const timeoutId = setTimeout(() => {
      console.log('Debounced search triggered for:', searchTerm);
      setPagination(prev => ({ ...prev, currentPage: 1 }));
      fetchUsers();
    }, 800);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const params = new URLSearchParams();
      params.append('page', pagination.currentPage.toString());
      params.append('limit', pagination.limit.toString());
      
      if (searchTerm && searchTerm.trim()) {
        params.append('search', searchTerm.trim());
      }
      
      if (statusFilter && statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      const queryString = params.toString();
      const url = `http://localhost:5000/api/admin/users?${queryString}`;
      
      console.log('Fetching users from:', url);

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('API Response:', data);
      
      if (data.success && data.data && data.data.users && Array.isArray(data.data.users)) {
        setUsers(data.data.users);
        
        if (data.data.pagination) {
          setPagination(prev => ({
            ...prev,
            totalPages: data.data.pagination.totalPages || 1,
            totalUsers: data.data.pagination.totalUsers || 0
          }));
        }
      } else {
        console.warn('Invalid response structure:', data);
        setUsers([]);
        setError('ไม่สามารถดึงข้อมูลผู้ใช้ได้');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        setError('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบว่าเซิร์ฟเวอร์ทำงานอยู่');
      } else {
        setError(error.message);
      }
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // ฟังก์ชันดึงสถิติรวมทั้งหมด
  const fetchTotalStats = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:5000/api/admin/users/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setTotalStats({
            total: data.data.total || 0,
            active: data.data.active || 0,
            premium: data.data.premium || 0,
            banned: data.data.banned || 0
          });
        }
      }
    } catch (error) {
      console.error('Error fetching total stats:', error);
    }
  };

  const banUser = async (userId, reason = 'Violation of terms') => {
    try {
      const confirmed = confirm('คุณแน่ใจหรือไม่ที่จะแบนผู้ใช้คนนี้?');
      if (!confirmed) return;

      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}/ban`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert('ผู้ใช้ถูกแบนเรียบร้อยแล้ว');
        fetchUsers();
        fetchTotalStats(); // อัพเดทสถิติรวม
        setShowUserModal(false);
      } else {
        console.error('Ban user error:', data);
        alert(`เกิดข้อผิดพลาด: ${data.message || 'ไม่สามารถแบนผู้ใช้ได้'}`);
      }
    } catch (error) {
      console.error('Error banning user:', error);
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์');
    }
  };

  const unbanUser = async (userId) => {
    try {
      const confirmed = confirm('คุณแน่ใจหรือไม่ที่จะยกเลิกการแบนผู้ใช้คนนี้?');
      if (!confirmed) return;

      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}/unban`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert('ยกเลิกการแบนผู้ใช้เรียบร้อยแล้ว');
        fetchUsers();
        fetchTotalStats(); // อัพเดทสถิติรวม
        setShowUserModal(false);
      } else {
        console.error('Unban user error:', data);
        alert(`เกิดข้อผิดพลาด: ${data.message || 'ไม่สามารถยกเลิกการแบนได้'}`);
      }
    } catch (error) {
      console.error('Error unbanning user:', error);
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์');
    }
  };

  // แก้ไข Avatar Image handling
  const getAvatarUrl = (user) => {
    if (user.avatar && user.avatar !== '/uploads/avatar/default.png') {
      return user.avatar.startsWith('http') ? user.avatar : `http://localhost:5000${user.avatar}`;
    }
    // ใช้ default avatar จาก Backend หรือ fallback เป็น data URL
    return 'http://localhost:5000/uploads/avatar/default.svg';
  };

  const handleAvatarError = (e) => {
    // Fallback เป็น SVG avatar
    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjUwIiBmaWxsPSIjOTI0MDBTIi8+CjxjaXJjbGUgY3g9IjUwIiBjeT0iMzUiIHI9IjE1IiBmaWxsPSIjZmZmIi8+CjxwYXRoIGQ9Ik0yNSA4NWMwLTEzLjggMTEuMi0yNSAyNS0yNXMyNSAxMS4yIDI1IDI1djEwSDI1di0xMHoiIGZpbGw9IiNmZmYiLz4KPC9zdmc+';
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    fetchUsers();
  };

  const handleStatusFilterChange = (newStatus) => {
    setStatusFilter(newStatus);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'ไม่ระบุ';
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-900/20 text-green-400 rounded-full text-xs">
          <CheckCircle size={12} /> ใช้งานได้
        </span>;
      case 'banned':
        return <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-900/20 text-red-400 rounded-full text-xs">
          <XCircle size={12} /> ถูกแบน
        </span>;
      case 'suspended':
        return <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-900/20 text-yellow-400 rounded-full text-xs">
          <AlertTriangle size={12} /> ระงับ
        </span>;
      default:
        return <span className="px-2 py-1 bg-zinc-700 text-zinc-300 rounded-full text-xs">{status || 'ไม่ระบุ'}</span>;
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-900/20 text-purple-400 rounded-full text-xs">
          <Shield size={12} /> Admin
        </span>;
      case 'premium':
        return <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-900/20 text-amber-400 rounded-full text-xs">
          <Crown size={12} /> Premium
        </span>;
      default:
        return <span className="px-2 py-1 bg-zinc-700 text-zinc-300 rounded-full text-xs">ผู้ใช้ทั่วไป</span>;
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button variant="outline" onClick={onBack} className="gap-2">
              <ArrowLeft size={16} /> กลับ
            </Button>
          )}
          <h2 className="text-2xl font-bold text-amber-400 font-serif">จัดการผู้ใช้งาน</h2>
        </div>
        <Button onClick={fetchUsers} variant="outline" className="gap-2">
          รีเฟรช
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" size={16} />
            <input
              type="text"
              placeholder="ค้นหาด้วยชื่อ, อีเมล, หรือ username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <Button type="submit" variant="outline">ค้นหา</Button>
        </form>
        
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => handleStatusFilterChange(e.target.value)}
            className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">ทุกสถานะ</option>
            <option value="active">ใช้งานได้</option>
            <option value="banned">ถูกแบน</option>
            <option value="suspended">ระงับ</option>
          </select>
          
          <Button 
            onClick={handleResetFilters} 
            variant="ghost" 
            className="text-zinc-400 hover:text-white"
          >
            ล้างตัวกรอง
          </Button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-4 p-4 bg-red-900/20 border border-red-500/50 rounded-lg text-red-400">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} />
            <span>เกิดข้อผิดพลาด: {error}</span>
          </div>
          <Button 
            onClick={fetchUsers} 
            variant="outline" 
            size="sm" 
            className="mt-2"
          >
            ลองใหม่
          </Button>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
        </div>
      ) : (
        <>
          {/* Users Stats */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-zinc-900/50">
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{totalStats.total}</div>
                  <div className="text-sm text-zinc-400">ผู้ใช้ทั้งหมด</div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-zinc-900/50">
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{totalStats.active}</div>
                  <div className="text-sm text-zinc-400">ใช้งานได้</div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-zinc-900/50">
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-400">{totalStats.premium}</div>
                  <div className="text-sm text-zinc-400">Premium</div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-zinc-900/50">
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-400">{totalStats.banned}</div>
                  <div className="text-sm text-zinc-400">ถูกแบน</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto bg-zinc-900/50 rounded-xl border border-zinc-800">
            <table className="w-full">
              <thead className="bg-black/30">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">ผู้ใช้</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">อีเมล</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">สถานะ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">บทบาท</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">เข้าสู่ระบบล่าสุด</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">วันที่สมัคร</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">การจัดการ</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(users) && users.length > 0 ? (
                  users.map(user => (
                    <tr key={user._id} className="border-t border-zinc-800 hover:bg-zinc-800/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Avatar className="w-10 h-10 mr-3">
                            <AvatarImage 
                              src={getAvatarUrl(user)}
                              alt={user.username}
                              onError={handleAvatarError}
                            />
                            <AvatarFallback className="bg-amber-800">
                              {user.username?.charAt(0).toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="text-sm font-medium text-white">{user.username}</div>
                            <div className="text-sm text-zinc-400">{user.firstName} {user.lastName}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(user.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getRoleBadge(user.role)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">
                        {formatDate(user.lastLogin)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user);
                              setShowUserModal(true);
                            }}
                            className="text-amber-400 hover:text-amber-300"
                          >
                            <Eye size={14} />
                          </Button>
                          {user.role !== 'admin' && (
                            user.status === 'banned' ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => unbanUser(user._id)}
                                className="text-green-400 hover:text-green-300"
                              >
                                <UserCheck size={14} />
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => banUser(user._id)}
                                className="text-red-400 hover:text-red-300"
                              >
                                <Ban size={14} />
                              </Button>
                            )
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-zinc-400">
                      {loading ? 'กำลังโหลดข้อมูล...' : 'ไม่พบข้อมูลผู้ใช้งาน'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-6 flex justify-between items-center">
              <div className="text-sm text-zinc-400">
                แสดง {users.length} จาก {pagination.totalUsers} ผู้ใช้
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.currentPage === 1}
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                >
                  ก่อนหน้า
                </Button>
                <span className="px-3 py-1 bg-zinc-800 rounded text-sm">
                  {pagination.currentPage} / {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.currentPage === pagination.totalPages}
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                >
                  ถัดไป
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* User Detail Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-xl border border-amber-500/30 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-zinc-900 border-b border-amber-500/20 p-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-amber-400 font-serif">รายละเอียดผู้ใช้</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowUserModal(false)}>
                <XCircle size={20} />
              </Button>
            </div>
            <div className="p-6">
              <div className="flex items-start gap-4 mb-6">
                <Avatar className="w-20 h-20">
                  <AvatarImage 
                    src={getAvatarUrl(selectedUser)}
                    alt={selectedUser.username}
                    onError={handleAvatarError}
                  />
                  <AvatarFallback className="bg-amber-800 text-2xl">
                    {selectedUser.username?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-white">{selectedUser.username}</h4>
                  <p className="text-zinc-300">{selectedUser.firstName} {selectedUser.lastName}</p>
                  <p className="text-zinc-400 text-sm">{selectedUser.email}</p>
                  {selectedUser.memberId && (
                    <p className="text-amber-300 text-sm font-mono">🆔 Member ID: {selectedUser.memberId}</p>
                  )}
                  <div className="flex gap-2 mt-2">
                    {getStatusBadge(selectedUser.status)}
                    {getRoleBadge(selectedUser.role)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-zinc-400">วันที่สมัคร:</span>
                  <p className="text-white">{formatDate(selectedUser.createdAt)}</p>
                </div>
                <div>
                  <span className="text-zinc-400">เข้าสู่ระบบล่าสุด:</span>
                  <p className="text-white">{formatDate(selectedUser.lastLogin)}</p>
                </div>
                <div>
                  <span className="text-zinc-400">เบอร์โทร:</span>
                  <p className="text-white">{selectedUser.phone || 'ไม่ระบุ'}</p>
                </div>
                <div>
                  <span className="text-zinc-400">ยืนยันตัวตน:</span>
                  <p className="text-white">{selectedUser.verified ? 'ยืนยันแล้ว' : 'ยังไม่ยืนยัน'}</p>
                </div>
              </div>

              {selectedUser.banReason && (
                <div className="mt-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                  <span className="text-red-400 font-medium">เหตุผลการแบน:</span>
                  <p className="text-white mt-1">{selectedUser.banReason}</p>
                </div>
              )}

              <div className="mt-6 flex gap-2">
                {selectedUser.role !== 'admin' && (
                  selectedUser.status === 'banned' ? (
                    <Button
                      variant="default"
                      onClick={() => unbanUser(selectedUser._id)}
                      className="gap-2"
                    >
                      <UserCheck size={16} /> ยกเลิกการแบน
                    </Button>
                  ) : (
                    <Button
                      variant="destructive"
                      onClick={() => banUser(selectedUser._id)}
                      className="gap-2"
                    >
                      <Ban size={16} /> แบนผู้ใช้
                    </Button>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
