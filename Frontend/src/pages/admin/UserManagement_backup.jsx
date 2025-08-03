import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '../../components/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import { Separator } from '../../components/ui/separator';
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
  ArrowLeft,
  User,
  ChevronLeft,
  ChevronRight,
  X,
  MessageCircle,
  Heart,
  Image
} from 'lucide-react';

const UserManagement = ({ onBack, filter = 'all' }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(filter);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showFullProfile, setShowFullProfile] = useState(false);
  const [fullProfileUser, setFullProfileUser] = useState(null);
  const [activeTab, setActiveTab] = useState('about');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
    limit: 20
  });

  useEffect(() => {
    fetchUsers();
  }, [statusFilter, pagination.currentPage]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      console.log('🔍 Fetching users with token:', token ? 'exists' : 'missing');
      console.log('🔍 API URL:', `http://localhost:5000/api/admin/users?page=${pagination.currentPage}&limit=${pagination.limit}&status=${statusFilter}`);
      
      const response = await fetch(`http://localhost:5000/api/admin/users?page=${pagination.currentPage}&limit=${pagination.limit}&status=${statusFilter}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('🔍 Response status:', response.status);
      console.log('🔍 Response ok:', response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log('🔍 Received data:', data);
        setUsers(data.users || []);
        setPagination(prev => ({
          ...prev,
          totalPages: data.totalPages || 1,
          totalUsers: data.totalUsers || 0
        }));
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('🔍 API Error:', errorData);
        setError('ไม่สามารถโหลดข้อมูลผู้ใช้ได้: ' + (errorData.message || 'Unknown error'));
      }
    } catch (err) {
      console.error('🔍 Fetch Error:', err);
      setError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  const handleViewFullProfile = async (user) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/users/${user._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setFullProfileUser(userData.user);
        setShowFullProfile(true);
        setActiveTab('about');
      } else {
        console.error('Failed to fetch user details');
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'ไม่ระบุ';
    return new Date(dateString).toLocaleDateString('th-TH');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-400/10';
      case 'suspended': return 'text-red-400 bg-red-400/10';
      case 'pending': return 'text-yellow-400 bg-yellow-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'ใช้งานได้';
      case 'suspended': return 'ถูกระงับ';
      case 'pending': return 'รอการอนุมัติ';
      default: return 'ไม่ทราบสถานะ';
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = searchTerm === '' || 
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-400">{error}</p>
        <Button onClick={fetchUsers} className="mt-4">ลองอีกครั้ง</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="text-amber-400 hover:text-amber-300"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            กลับ
          </Button>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="h-6 w-6 text-amber-500" />
            จัดการผู้ใช้งาน
          </h1>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="ค้นหาผู้ใช้..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">ทั้งหมด</option>
            <option value="active">ใช้งานได้</option>
            <option value="suspended">ถูกระงับ</option>
            <option value="pending">รอการอนุมัติ</option>
          </select>
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredUsers.map((user) => (
          <Card key={user._id} className="bg-zinc-800 border-zinc-700 hover:border-amber-500/50 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4 mb-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage 
                    src={user.profileImage || `https://images.unsplash.com/photo-1${Math.floor(Math.random() * 10)}?w=100&h=100&fit=crop&crop=face`}
                    alt={user.username} 
                  />
                  <AvatarFallback className="bg-amber-500 text-black">
                    {user.firstName?.[0]}{user.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-medium truncate">
                    {user.firstName} {user.lastName}
                  </h3>
                  <p className="text-gray-400 text-sm truncate">@{user.username}</p>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">อีเมล:</span>
                  <span className="text-white truncate ml-2">{user.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">สถานะ:</span>
                  <span className={`px-2 py-1 rounded text-xs ${getStatusColor(user.status)}`}>
                    {getStatusText(user.status)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">สมัครเมื่อ:</span>
                  <span className="text-white">{formatDate(user.createdAt)}</span>
                </div>
              </div>

              <div className="flex justify-between mt-4 pt-4 border-t border-zinc-700">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleViewFullProfile(user)}
                  className="text-amber-400 hover:text-amber-300"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  ดูโปรไฟล์
                </Button>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300">
                    <UserCheck className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300">
                    <Ban className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <Button
            variant="outline"
            onClick={() => setPagination(prev => ({ ...prev, currentPage: Math.max(1, prev.currentPage - 1) }))}
            disabled={pagination.currentPage === 1}
            className="border-zinc-700 text-white hover:bg-zinc-800"
          >
            ก่อนหน้า
          </Button>
          <span className="text-white">
            หน้า {pagination.currentPage} จาก {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPagination(prev => ({ ...prev, currentPage: Math.min(prev.totalPages, prev.currentPage + 1) }))}
            disabled={pagination.currentPage === pagination.totalPages}
            className="border-zinc-700 text-white hover:bg-zinc-800"
          >
            ถัดไป
          </Button>
        </div>
      )}

      {/* Full Profile Modal - Compact Design */}
      {showFullProfile && fullProfileUser && (
        <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-xl w-full max-w-5xl h-[80vh] overflow-hidden border border-zinc-700">
            <div className="flex h-full">
              {/* Left Side - Photo Gallery */}
              <div className="w-2/5 relative bg-black">
                <div className="relative h-full flex items-center justify-center">
                  <img 
                    src={fullProfileUser.avatar || `https://images.unsplash.com/photo-1${Math.floor(Math.random() * 10)}?w=800&h=600&fit=crop&crop=face`}
                    alt={fullProfileUser.name}
                    className="max-w-full max-h-full object-contain"
                  />
                  
                  {/* Navigation arrows */}
                  <button className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70">
                    <ChevronLeft size={20} />
                  </button>
                  <button className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70">
                    <ChevronRight size={20} />
                  </button>
                  
                  {/* Photo indicator dots */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <div className="w-2 h-2 bg-white bg-opacity-50 rounded-full"></div>
                  </div>
                </div>
                
                {/* Profile summary overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4 text-white">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-xl font-bold">{fullProfileUser.name?.split(' ')[0] || 'Unknown'}</h2>
                    <span className="text-lg">{fullProfileUser.age || '-'}</span>
                    {fullProfileUser.verified && (
                      <div className="bg-amber-500 text-black rounded-full p-1">
                        <CheckCircle size={14} />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-amber-400">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-sm">{fullProfileUser.location || 'ไม่ระบุ'}</span>
                  </div>
                </div>
              </div>

              {/* Right Side - Profile Details */}
              <div className="w-3/5 bg-zinc-900 flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-zinc-700 flex-shrink-0">
                  <button 
                    onClick={() => {
                      setShowFullProfile(false);
                      setFullProfileUser(null);
                    }}
                    className="text-amber-500 hover:text-amber-400 flex items-center gap-2"
                  >
                    <ChevronLeft size={18} />
                    กลับสู่ผู้ใช้งาน
                  </button>
                  <button 
                    onClick={() => {
                      setShowFullProfile(false);
                      setFullProfileUser(null);
                    }}
                    className="text-gray-400 hover:text-white"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto">
                  {/* Tab Navigation */}
                  <div className="px-4 py-3 sticky top-0 bg-zinc-900 z-10 border-b border-zinc-700">
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                      <TabsList className="bg-zinc-800/50 border border-amber-500/20 w-full">
                        <TabsTrigger value="about" className="data-[state=active]:bg-amber-500 data-[state=active]:text-black text-sm flex-1">เกี่ยวกับฉัน</TabsTrigger>
                        <TabsTrigger value="preferences" className="data-[state=active]:bg-amber-500 data-[state=active]:text-black text-sm flex-1">สิ่งที่ฉันต้องการ</TabsTrigger>
                        <TabsTrigger value="photos" className="data-[state=active]:bg-amber-500 data-[state=active]:text-black text-sm flex-1">รูปภาพ</TabsTrigger>
                      </TabsList>
                      
                      {/* Tab Content */}
                      <div className="px-4 py-4">
                        <TabsContent value="about" className="mt-0">
                          <div className="space-y-4">
                            {/* ข้อมูลพื้นฐาน */}
                            <div>
                              <h3 className="text-lg font-bold text-amber-400 font-serif mb-3">🧍‍♂️ ข้อมูลพื้นฐาน</h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2 text-zinc-300 text-sm">
                                    <span className="text-amber-500 font-medium w-24">ชื่อเล่น:</span>
                                    <span>{fullProfileUser.nickname || 'ไม่ระบุ'}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-zinc-300 text-sm">
                                    <span className="text-amber-500 font-medium w-24">อายุ:</span>
                                    <span>{fullProfileUser.age ? `${fullProfileUser.age} ปี` : 'ไม่ระบุ'}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-zinc-300 text-sm">
                                    <span className="text-amber-500 font-medium w-24">น้ำหนัก:</span>
                                    <span>{fullProfileUser.weight ? `${fullProfileUser.weight} กก.` : 'ไม่ระบุ'}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-zinc-300 text-sm">
                                    <span className="text-amber-500 font-medium w-24">ส่วนสูง:</span>
                                    <span>{fullProfileUser.personalDetails?.height ? `${fullProfileUser.personalDetails.height} ซม.` : 'ไม่ระบุ'}</span>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2 text-zinc-300 text-sm">
                                    <span className="text-amber-500 font-medium w-24">เพศ:</span>
                                    <span>{fullProfileUser.gender || 'ไม่ระบุ'}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-zinc-300 text-sm">
                                    <span className="text-amber-500 font-medium w-24">อาชีพ:</span>
                                    <span>{fullProfileUser.occupation || 'ไม่ระบุ'}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-zinc-300 text-sm">
                                    <span className="text-amber-500 font-medium w-24">ที่อยู่:</span>
                                    <span>{fullProfileUser.location || 'ไม่ระบุ'}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <Separator className="my-4 bg-amber-500/20" />
                            
                            {/* คำบรรยายตัวเอง */}
                            <div>
                              <h3 className="text-lg font-bold text-amber-400 font-serif mb-2">💬 คำบรรยายตัวเอง</h3>
                              <p className="text-zinc-300 leading-relaxed bg-zinc-800/30 p-3 rounded-lg border border-amber-500/20 text-sm">
                                {fullProfileUser.selfDescription || 'ยังไม่ได้เพิ่มคำบรรยายตัวเอง'}
                              </p>
                              {fullProfileUser.bio && (
                                <div className="mt-2">
                                  <h4 className="text-amber-400 font-medium mb-1 text-sm">เกี่ยวกับฉัน</h4>
                                  <p className="text-zinc-300 leading-relaxed text-sm">{fullProfileUser.bio}</p>
                                </div>
                              )}
                            </div>
                            
                            <Separator className="my-4 bg-amber-500/20" />
                            
                            {/* ความชอบ & ไลฟ์สไตล์ */}
                            <div>
                              <h3 className="text-lg font-bold text-amber-400 font-serif mb-3">❤️ ความชอบ & ไลฟ์สไตล์</h3>
                              
                              <div className="space-y-3">
                                {/* ความสนใจ */}
                                <div>
                                  <h4 className="text-amber-400 font-medium mb-2 text-sm">ความสนใจ</h4>
                                  <div className="flex flex-wrap gap-2">
                                    {(fullProfileUser.interests || []).map((interest, index) => (
                                      <span 
                                        key={index} 
                                        className="bg-amber-500/10 text-amber-400 px-2 py-1 rounded-full text-xs"
                                      >
                                        {interest}
                                      </span>
                                    ))}
                                    {(!fullProfileUser.interests || fullProfileUser.interests.length === 0) && (
                                      <span className="text-zinc-500 text-sm">ยังไม่ได้ระบุ</span>
                                    )}
                                  </div>
                                </div>
                                
                                {/* สัตว์เลี้ยง */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  <div>
                                    <h4 className="text-amber-400 font-medium mb-2 text-sm">สัตว์เลี้ยง</h4>
                                    <div className="flex flex-wrap gap-2">
                                      {(fullProfileUser.pets || []).map((pet, index) => (
                                        <span key={index} className="bg-green-500/10 text-green-400 px-2 py-1 rounded-full text-xs">
                                          {pet}
                                        </span>
                                      ))}
                                      {(!fullProfileUser.pets || fullProfileUser.pets.length === 0) && (
                                        <span className="text-zinc-500 text-sm">ยังไม่ได้ระบุ</span>
                                      )}
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <h4 className="text-amber-400 font-medium mb-2 text-sm">สไตล์การใช้ชีวิต</h4>
                                    <span className="text-zinc-300 text-sm">{fullProfileUser.lifestyle || 'ยังไม่ได้ระบุ'}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </TabsContent>
                        
                        {/* Preferences Tab */}
                        <TabsContent value="preferences" className="mt-0">
                          <div className="space-y-4">
                            {/* มองหาอะไร */}
                            <div>
                              <h3 className="text-lg font-bold text-amber-400 font-serif mb-3">🕊️ มองหาอะไรในเว็บนี้</h3>
                              <div className="flex flex-wrap gap-2 mb-4">
                                {(fullProfileUser.lookingFor || []).map((item, index) => (
                                  <span 
                                    key={index} 
                                    className="bg-amber-500/10 text-amber-400 px-3 py-1 rounded-full text-sm"
                                  >
                                    {item}
                                  </span>
                                ))}
                                {(!fullProfileUser.lookingFor || fullProfileUser.lookingFor.length === 0) && (
                                  <span className="text-zinc-500 text-sm">ยังไม่ได้ระบุ</span>
                                )}
                              </div>
                              <div className="bg-zinc-800/30 p-4 rounded-lg border border-amber-500/20">
                                <p className="text-zinc-300 text-sm">{fullProfileUser.relationshipGoal || 'ยังไม่ได้ระบุเป้าหมายความสัมพันธ์'}</p>
                              </div>
                            </div>
                            
                            <Separator className="my-4 bg-amber-500/20" />
                            
                            {/* สเปคที่ชอบ */}
                            <div>
                              <h3 className="text-lg font-bold text-amber-400 font-serif mb-3">🧲 สเปคหรือคุณสมบัติที่ชอบ</h3>
                              <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="text-amber-400 font-medium mb-2 text-sm">ช่วงอายุที่สนใจ</h4>
                                    <span className="text-zinc-300 text-sm">
                                      {fullProfileUser.idealMatch?.ageRange?.min && fullProfileUser.idealMatch?.ageRange?.max 
                                        ? `${fullProfileUser.idealMatch.ageRange.min} - ${fullProfileUser.idealMatch.ageRange.max} ปี`
                                        : 'ไม่ระบุ'
                                      }
                                    </span>
                                  </div>
                                  <div>
                                    <h4 className="text-amber-400 font-medium mb-2 text-sm">บุคลิกที่ชอบ</h4>
                                    <span className="text-zinc-300 text-sm">{fullProfileUser.idealMatch?.personality || 'ไม่ระบุ'}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </TabsContent>
                        
                        {/* Photos Tab */}
                        <TabsContent value="photos" className="mt-0">
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <h3 className="text-lg font-bold text-amber-400 font-serif">รูปภาพทั้งหมด</h3>
                            </div>
                            
                            {fullProfileUser.photos && fullProfileUser.photos.length > 0 ? (
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {fullProfileUser.photos.map((photo, index) => (
                                  <div key={index} className="relative group aspect-square">
                                    <img 
                                      src={photo || `https://images.unsplash.com/photo-1${Math.floor(Math.random() * 10)}?w=400&h=400&fit=crop&crop=face`}
                                      alt={`Photo ${index + 1}`}
                                      className="w-full h-full object-cover rounded-lg border border-amber-500/30"
                                    />
                                    {index === 0 && (
                                      <div className="absolute top-2 left-2 bg-amber-500 text-black text-xs px-2 py-1 rounded-full">
                                        รูปโปรไฟล์
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-10 border border-dashed border-amber-500/30 rounded-lg">
                                <Image size={40} className="mx-auto text-amber-500/50 mb-3" />
                                <p className="text-zinc-400">ไม่มีรูปภาพ</p>
                              </div>
                            )}
                          </div>
                        </TabsContent>
                      </div>
                    </Tabs>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
